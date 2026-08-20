# UI and backend cleanups

Final session before subsmission where we're going to address a handful of UI issues and make sure core functionality is working.

## Define DB constraints for direct messsage uniqueness

During a test run I noticed that the conversations table has a dm_key column that's just TEXT. It is supposed to drive the uniqueness of direct message convos between any two members but there are no constraints for it. This is something I missed during the data model audit.

Replace dm_key with

  - two columns dm_member_a and dm_member_b that are actual foreign keys to conversation_members table
  - this allows us to create a unique index on (company_id, dm_member_a, dm_member_b) to ensure DM uniqueness
  - the FKs to create are composite keys: (id, dm_member_a) -> conversation_members(conversation_id,member_id) and a second one for dm_member_b

## Group chat creation looks broken

I can create DMs from the UI, but as soon as I pick a second member the button switches to "Create group chat" and clicking it does nothing. The button appears to be disabled but it's styled exactly the same as an active button.

In addition to the styling fix, make sure that clicking on the button highlights the Group name input field with a red border.

## Remove mock UI elements

Hide the Search field in the conversation sidebar and the pencil icon at the top.

## Demo ability to "sign in" as a different user

Add support for the `?as=<user>` URL query param to load a different user's session. This will allow us to demo how different users see different conversations and how messages are synced between them. This is a stopgap feature while we don't have real auth in place.

## Scroll-to-bottom in conversation views

Add a quick scroll-to-bottom anchor. Currently nothing in the UI indicates that a new message has been received when the conversation is already open.

## Remove the demo landing page

Navigating to the root route should load the /chats view.
