defmodule HotelChat.Companies.Location do
  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Companies.Company

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "locations" do
    belongs_to :company, Company
    field :name, :string
    field :city, :string
    field :timezone, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(location, attrs) do
    location
    |> cast(attrs, [:id, :company_id, :name, :city, :timezone])
    |> validate_required([:company_id, :name, :timezone])
    |> foreign_key_constraint(:company_id)
  end
end
