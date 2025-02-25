import os
import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("ENCRYPTION_KEY")
if not key:
    raise ValueError ("ENCRYPTION_KEY not found in environment variables")
fernet = Fernet(key)


class FileTransferConsumer(AsyncWebsocketConsumer):
    """
    A WebSocket consumer that handles file transfers between users,
    based on unique identifiers.
    """

    async def connect(self):
        """
        Assign a unique ID to the connected user.
        """
        # Generate a unique ID for the connected user
        self.user_id = str(uuid.uuid4())[:10]
        self.room_group_name = "global"

        # Add the user to the WebSocket group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

        # Send the unique ID back to the user for display
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_id",
                    "user_id": self.user_id,
                }
            )
        )

    async def disconnect(self, close_code):
        """
        Remove the user from the group when they disconnect.
        """
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Handle incoming files from specific users based on user_id.
        """
        data = json.loads(text_data)  # Parse the JSON data

        # Check if JSON data contain a file and a target user ID
        if "file" in data and "target_user_id" in data:
            # Extract target user id, file name, file content
            target_user_id = data["target_user_id"]
            file_name = data["file_name"]
            file_content = data["file"]

            # NOTE: FOR DEVELOPMENT ONLY !!!
            # print("Original: ", file_content[:10])

            # Encrypt the byte-encoded file content
            encrypted_content = fernet.encrypt(file_content.encode()).decode()

            # NOTE: FOR DEVELOPMENT ONLY !!!
            # print("Encrypted: ", encrypted_content[:10])

            # Send the file only to the specific user,
            # based on their user_id
            await self.send_to_user(
                target_user_id,
                {
                    "type": "file_offer",
                    "file_name": file_name,
                    "file": encrypted_content,
                    "sender_id": self.user_id,
                },
            )

    async def send_to_user(self, target_user_id, file_data):
        """
        Send a file to a specific user identified by their user_id.
        """
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "send_file",
                "file_data": file_data,
                "target_user_id": target_user_id,
            },
        )

    async def send_file(self, event):
        """
        Send the file to the specific target user.
        """
        file_data = event["file_data"]
        target_user_id = event["target_user_id"]

        if self.user_id == target_user_id:
            encrypted_file_content = file_data["file"]

            # Decrypt the file content from encrypted base64,
            # to original byte-encoded string
            decrypted_content = fernet.decrypt(encrypted_file_content.encode()).decode()

            await self.send(
                text_data=json.dumps(
                    {
                        "type": "file_offer",
                        "file_name": file_data["file_name"],
                        "file": decrypted_content,
                        "sender_id": file_data["sender_id"],
                    }
                )
            )
