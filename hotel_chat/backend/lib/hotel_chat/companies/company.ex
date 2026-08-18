defmodule HotelChat.Companies.Company do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}

  schema "companies" do
    field :name, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(company, attrs) do
    company
    |> cast(attrs, [:id, :name])
    |> validate_required([:name])
  end
end
