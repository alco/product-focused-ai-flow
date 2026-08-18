defmodule HotelChat.Conversations.MessageAttachment do
  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Conversations.Message

  @kinds ~w(image file)

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "message_attachments" do
    belongs_to :message, Message
    field :kind, :string
    field :object_key, :string
    field :url, :string
    field :file_name, :string
    field :content_type, :string
    field :byte_size, :integer
    field :width, :integer
    field :height, :integer

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(message_attachment, attrs) do
    message_attachment
    |> cast(attrs, [
      :id,
      :message_id,
      :kind,
      :object_key,
      :url,
      :file_name,
      :content_type,
      :byte_size,
      :width,
      :height
    ])
    |> validate_required([:message_id, :kind, :object_key, :url, :content_type, :byte_size])
    |> validate_inclusion(:kind, @kinds)
    |> foreign_key_constraint(:message_id)
  end
end
