defmodule HotelChat.Repo.Migrations.ReplaceDmKeyWithMemberPair do
  @moduledoc """
  The DM-uniqueness key was a free-form text column (`dm_key`) whose
  "sorted uuid pair" format existed only as a convention duplicated across
  writers — which is exactly how seeds once wrote slug pairs and escaped the
  one-DM-per-pair constraint. Replace it with two real columns the database
  can vouch for:

    * `dm_member_a` / `dm_member_b` — the DM's two members, canonically
      ordered (enforced by CHECK), present iff `kind = 'dm'` (CHECK).
    * one-DM-per-pair — partial unique index over the pair.
    * validity — composite FKs to `conversation_members(conversation_id,
      member_id)`, so each id must be a real member of *this* conversation
      (and transitively a real `members` row). DEFERRABLE INITIALLY DEFERRED
      because the conversation row is inserted before its membership rows;
      the check runs at commit. Note: the Ecto SQL sandbox never commits, so
      ExUnit tests do not exercise these two FKs.
  """
  use Ecto.Migration

  def up do
    alter table(:conversations) do
      add :dm_member_a, :binary_id
      add :dm_member_b, :binary_id
    end

    execute """
    UPDATE conversations c
    SET dm_member_a = p.a, dm_member_b = p.b
    FROM (
      SELECT conversation_id,
             (array_agg(member_id ORDER BY member_id))[1] AS a,
             (array_agg(member_id ORDER BY member_id))[2] AS b
      FROM conversation_members
      GROUP BY conversation_id
    ) p
    WHERE c.kind = 'dm' AND c.id = p.conversation_id
    """

    alter table(:conversations) do
      remove :dm_key
    end

    create constraint(:conversations, :dm_pair_only_on_dms,
             check: "(kind = 'dm') = (dm_member_a IS NOT NULL AND dm_member_b IS NOT NULL)"
           )

    create constraint(:conversations, :dm_pair_ordered,
             check: "dm_member_a IS NULL OR dm_member_a < dm_member_b"
           )

    create unique_index(:conversations, [:company_id, :dm_member_a, :dm_member_b],
             where: "kind = 'dm'",
             name: :conversations_dm_pair_index
           )

    execute """
    ALTER TABLE conversations
      ADD CONSTRAINT conversations_dm_member_a_fkey
        FOREIGN KEY (id, dm_member_a)
        REFERENCES conversation_members (conversation_id, member_id)
        DEFERRABLE INITIALLY DEFERRED,
      ADD CONSTRAINT conversations_dm_member_b_fkey
        FOREIGN KEY (id, dm_member_b)
        REFERENCES conversation_members (conversation_id, member_id)
        DEFERRABLE INITIALLY DEFERRED
    """
  end

  def down do
    execute """
    ALTER TABLE conversations
      DROP CONSTRAINT conversations_dm_member_a_fkey,
      DROP CONSTRAINT conversations_dm_member_b_fkey
    """

    drop unique_index(:conversations, [:company_id, :dm_member_a, :dm_member_b],
           name: :conversations_dm_pair_index
         )

    drop constraint(:conversations, :dm_pair_ordered)
    drop constraint(:conversations, :dm_pair_only_on_dms)

    alter table(:conversations) do
      add :dm_key, :text
    end

    execute """
    UPDATE conversations
    SET dm_key = dm_member_a::text || ':' || dm_member_b::text
    WHERE kind = 'dm'
    """

    create unique_index(:conversations, [:company_id, :dm_key],
             where: "kind = 'dm'",
             name: :conversations_company_id_dm_key_index
           )

    alter table(:conversations) do
      remove :dm_member_a
      remove :dm_member_b
    end
  end
end
