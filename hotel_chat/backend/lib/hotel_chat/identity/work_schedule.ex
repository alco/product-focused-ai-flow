defmodule HotelChat.Identity.WorkSchedule do
  @moduledoc """
  [IDENTITY — THROWAWAY]

  Display-only in the app; feeds the push working-hours gate. Seeded with mock
  data (agent_artifacts/data-model.md, session-1 R8).
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Identity.Member

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "work_schedules" do
    belongs_to :member, Member
    field :weekday, :integer
    field :starts_at, :time
    field :ends_at, :time

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(work_schedule, attrs) do
    work_schedule
    |> cast(attrs, [:id, :member_id, :weekday, :starts_at, :ends_at])
    |> validate_required([:member_id, :weekday, :starts_at, :ends_at])
    |> validate_inclusion(:weekday, 0..6)
    |> unique_constraint([:member_id, :weekday])
    |> foreign_key_constraint(:member_id)
  end
end
