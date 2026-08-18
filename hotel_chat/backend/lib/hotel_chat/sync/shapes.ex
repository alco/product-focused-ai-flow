defmodule HotelChat.Sync.Shapes do
  @moduledoc """
  Server-side shape definitions for the Electric sync proxy.

  The client selects a shape by name (`GET /api/sync/:shape`); the table,
  where-clause, columns and where-clause params are always decided here —
  never taken from the request. This is the authorization boundary for the
  read path: a client can only sync data a definition below hands it, scoped
  by its own session.

  The full planned catalog (S1–S10) lives in 2026-08-18-shape-model.md and
  gets implemented here as its tables land. `session` is the authenticated
  context (member id, company id); until auth exists it is an empty map and
  only unscoped demo shapes are defined.
  """

  @type definition :: %{
          required(:table) => String.t(),
          optional(:where) => String.t(),
          optional(:params) => %{String.t() => String.t()},
          optional(:columns) => [String.t()]
        }

  @spec define(String.t(), map()) :: {:ok, definition()} | :error
  def define("group_chats", _session) do
    {:ok, %{table: "group_chats"}}
  end

  def define(_unknown, _session), do: :error
end
