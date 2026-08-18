defmodule HotelChat.Identity.MemberLocation do
  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Companies.Location
  alias HotelChat.Identity.Member

  @primary_key false
  @foreign_key_type :binary_id

  schema "member_locations" do
    belongs_to :member, Member, primary_key: true
    belongs_to :location, Location, primary_key: true

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(member_location, attrs) do
    member_location
    |> cast(attrs, [:member_id, :location_id])
    |> validate_required([:member_id, :location_id])
    |> foreign_key_constraint(:member_id)
    |> foreign_key_constraint(:location_id)
  end
end
