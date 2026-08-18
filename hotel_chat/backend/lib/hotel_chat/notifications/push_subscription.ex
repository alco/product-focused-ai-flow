defmodule HotelChat.Notifications.PushSubscription do
  @moduledoc "Never synced — the push scheduler reads it server-side."

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Identity.Member

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "push_subscriptions" do
    belongs_to :member, Member
    field :endpoint, :string
    field :keys, :map
    field :user_agent, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(push_subscription, attrs) do
    push_subscription
    |> cast(attrs, [:id, :member_id, :endpoint, :keys, :user_agent])
    |> validate_required([:member_id, :endpoint, :keys])
    |> unique_constraint(:endpoint)
    |> foreign_key_constraint(:member_id)
  end
end
