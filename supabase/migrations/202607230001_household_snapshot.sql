create or replace function public.endorse_completion_with_note(
  target_completion uuid,
  target_endorser uuid,
  target_response public.endorsement_response,
  target_note text default null
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  endorsement_id uuid;
begin
  endorsement_id := public.endorse_completion(target_completion, target_endorser, target_response);
  update public.endorsements
  set note = nullif(left(trim(target_note), 120), '')
  where id = endorsement_id;
  return endorsement_id;
end;
$$;

create or replace function public.household_snapshot(
  target_household uuid,
  target_member uuid
)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  member_role public.household_role;
  result jsonb;
begin
  if not public.is_household_member(target_household) then
    raise exception 'Household unavailable';
  end if;
  if not public.can_act_as_member(target_member) then
    raise exception 'Cannot view this profile';
  end if;

  select role into member_role
  from public.household_members
  where id = target_member and household_id = target_household and active;
  if member_role is null then raise exception 'Profile unavailable'; end if;

  select jsonb_build_object(
    'household', jsonb_build_object(
      'id', home.id,
      'name', home.name,
      'timezone', home.timezone,
      'quietHoursStart', to_char(settings.quiet_hours_start, 'HH24:MI'),
      'quietHoursEnd', to_char(settings.quiet_hours_end, 'HH24:MI'),
      'members', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', member.id,
          'householdId', member.household_id,
          'displayName', member.display_name,
          'initials', member.initials,
          'role', member.role,
          'colour', member.colour,
          'pointLabel', member.point_label,
          'contributionTarget', coalesce((
            select target.weekly_target
            from public.contribution_targets target
            where target.member_id = member.id
              and target.valid_from <= current_date
              and (target.valid_until is null or target.valid_until >= current_date)
            order by target.valid_from desc, target.created_at desc
            limit 1
          ), 0)
        ) order by member.created_at)
        from public.household_members member
        where member.household_id = home.id and member.active
      ), '[]'::jsonb)
    ),
    'quests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', quest.id,
        'householdId', quest.household_id,
        'templateId', quest.template_id,
        'title', quest.title,
        'instruction', quest.instruction,
        'spokenInstruction', quest.spoken_instruction,
        'kind', quest.kind,
        'state', quest.state,
        'effort', quest.effort,
        'appreciationValue', quest.appreciation_value,
        'contributionValue', quest.contribution_value,
        'icon', quest.icon,
        'participantIds', coalesce((
          select jsonb_agg(participant.member_id order by participant.joined_at)
          from public.quest_participants participant
          where participant.quest_id = quest.id
        ), '[]'::jsonb),
        'suggestedMemberIds', '[]'::jsonb,
        'dueDate', quest.due_date,
        'urgency', quest.urgency,
        'completedAt', quest.completed_at
      ) order by quest.created_at)
      from public.daily_quests quest
      where quest.household_id = home.id
        and quest.due_date between current_date - 7 and current_date + 1
    ), '[]'::jsonb),
    'completions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', completion.id,
        'householdId', completion.household_id,
        'questId', completion.quest_id,
        'markedById', completion.marked_by_id,
        'participantIds', completion.participant_ids,
        'createdAt', completion.created_at
      ) order by completion.created_at)
      from public.completions completion
      where completion.household_id = home.id
    ), '[]'::jsonb),
    'endorsements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', endorsement.id,
        'householdId', endorsement.household_id,
        'questId', endorsement.quest_id,
        'completionId', endorsement.completion_id,
        'endorserId', endorsement.endorser_id,
        'response', endorsement.response,
        'note', endorsement.note,
        'createdAt', endorsement.created_at
      ) order by endorsement.created_at)
      from public.endorsements endorsement
      where endorsement.household_id = home.id
    ), '[]'::jsonb),
    'pointLedger', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', points.id,
        'householdId', points.household_id,
        'memberId', points.member_id,
        'questId', points.quest_id,
        'amount', points.amount,
        'reason', points.reason,
        'idempotencyKey', points.idempotency_key,
        'createdAt', points.created_at
      ) order by points.created_at)
      from public.point_ledger_entries points
      where points.household_id = home.id
    ), '[]'::jsonb),
    'contributionLedger', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', contribution.id,
        'householdId', contribution.household_id,
        'memberId', contribution.member_id,
        'questId', contribution.quest_id,
        'units', contribution.units,
        'idempotencyKey', contribution.idempotency_key,
        'createdAt', contribution.created_at
      ) order by contribution.created_at)
      from public.contribution_records contribution
      where contribution.household_id = home.id
    ), '[]'::jsonb),
    'rewards', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', reward.id,
        'householdId', reward.household_id,
        'title', reward.title,
        'icon', reward.icon,
        'cost', reward.cost,
        'audience', reward.audience,
        'requiresConsent', reward.requires_consent
      ) order by reward.created_at)
      from public.rewards reward
      where reward.household_id = home.id
        and reward.active
        and (reward.audience = 'all' or reward.audience = member_role::text)
        and (not reward.private_to_adults or member_role = 'adult')
    ), '[]'::jsonb),
    'redemptions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', redemption.id,
        'householdId', redemption.household_id,
        'rewardId', redemption.reward_id,
        'memberId', redemption.member_id,
        'status', redemption.status,
        'createdAt', redemption.created_at
      ) order by redemption.created_at)
      from public.redemptions redemption
      where redemption.household_id = home.id and redemption.member_id = target_member
    ), '[]'::jsonb),
    'highFives', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', high_five.id,
        'householdId', high_five.household_id,
        'fromMemberId', high_five.from_member_id,
        'toMemberId', high_five.to_member_id,
        'questId', high_five.quest_id,
        'createdAt', high_five.created_at
      ) order by high_five.created_at)
      from public.high_fives high_five
      where high_five.household_id = home.id
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(history.event order by history.created_at desc)
      from (
        select participant.joined_at as created_at, jsonb_build_object(
          'id', 'join-' || participant.id,
          'householdId', participant.household_id,
          'type', 'joined',
          'actorId', participant.member_id,
          'questId', participant.quest_id,
          'message', member.display_name || ' joined ' || quest.title || '.',
          'createdAt', participant.joined_at
        ) as event
        from public.quest_participants participant
        join public.household_members member on member.id = participant.member_id
        join public.daily_quests quest on quest.id = participant.quest_id
        where participant.household_id = home.id
        union all
        select completion.created_at, jsonb_build_object(
          'id', 'done-' || completion.id,
          'householdId', completion.household_id,
          'type', 'marked_done',
          'actorId', completion.marked_by_id,
          'questId', completion.quest_id,
          'message', quest.title || ' is waiting for thanks.',
          'createdAt', completion.created_at
        )
        from public.completions completion
        join public.daily_quests quest on quest.id = completion.quest_id
        where completion.household_id = home.id
        union all
        select endorsement.created_at, jsonb_build_object(
          'id', 'endorsement-' || endorsement.id,
          'householdId', endorsement.household_id,
          'type', case when endorsement.response = 'thanked' then 'thanked' else 'needs_more' end,
          'actorId', endorsement.endorser_id,
          'questId', endorsement.quest_id,
          'message', case
            when endorsement.response = 'thanked' and endorsement.note is not null
              then member.display_name || ' thanked ' || quest.title || ': “' || endorsement.note || '”'
            when endorsement.response = 'thanked'
              then member.display_name || ' sent thanks for ' || quest.title || '.'
            else quest.title || ' needs one small finishing touch.'
          end,
          'createdAt', endorsement.created_at
        )
        from public.endorsements endorsement
        join public.household_members member on member.id = endorsement.endorser_id
        join public.daily_quests quest on quest.id = endorsement.quest_id
        where endorsement.household_id = home.id
        union all
        select high_five.created_at, jsonb_build_object(
          'id', 'high-five-' || high_five.id,
          'householdId', high_five.household_id,
          'type', 'high_five',
          'actorId', high_five.from_member_id,
          'questId', high_five.quest_id,
          'message', sender.display_name || ' high-fived ' || recipient.display_name || '.',
          'createdAt', high_five.created_at
        )
        from public.high_fives high_five
        join public.household_members sender on sender.id = high_five.from_member_id
        join public.household_members recipient on recipient.id = high_five.to_member_id
        where high_five.household_id = home.id
      ) history
    ), '[]'::jsonb)
  ) into result
  from public.households home
  join public.household_settings settings on settings.household_id = home.id
  where home.id = target_household;

  if result is null then raise exception 'Household unavailable'; end if;
  return result;
end;
$$;

revoke all on function public.household_snapshot(uuid, uuid) from public;
revoke all on function public.endorse_completion_with_note(uuid, uuid, public.endorsement_response, text) from public;
grant execute on function public.household_snapshot(uuid, uuid) to authenticated;
grant execute on function public.endorse_completion_with_note(uuid, uuid, public.endorsement_response, text) to authenticated;
