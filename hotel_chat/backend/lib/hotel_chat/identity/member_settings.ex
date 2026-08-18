defmodule HotelChat.Identity.MemberSettings do
  @moduledoc """
  Per-member private state — split from `Member` so the company-wide directory
  shape never carries it (agent_artifacts/data-model.md).
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Identity.Member

  @primary_key false
  @foreign_key_type :binary_id

  schema "member_settings" do
    belongs_to :member, Member, primary_key: true
    field :snoozed_until, :utc_datetime_usec
    field :snooze_minutes, :integer, default: 30
    field :language, :string, default: "en"

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(member_settings, attrs) do
    member_settings
    |> cast(attrs, [:member_id, :snoozed_until, :snooze_minutes, :language])
    |> validate_required([:member_id, :snooze_minutes, :language])
    |> foreign_key_constraint(:member_id)
  end
end
