defmodule HotelChatWeb.ErrorJSONTest do
  use HotelChatWeb.ConnCase, async: true

  test "renders 404" do
    assert HotelChatWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert HotelChatWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
