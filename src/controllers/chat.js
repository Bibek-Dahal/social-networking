import { Chat } from '../models/chat.js';
import { Room } from '../models/room.js';
import { User } from '../models/user.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/pagination.js';
import { prepareSearchQuery } from '../utils/prepareSearchQuery.js';
export class ChatController {
  static getOrCreateRoomName = async (senderId, reveiverId) => {
    const userIds = [senderId, reveiverId];
    userIds.sort();
    const roomName = userIds[0] + userIds[1];

    let room;
    room = await Room.findOne({ room: roomName });
    console.log('room===', room);
    if (room) {
      console.log('inside if===');
      return room;
    }

    room = await Room.create({
      room: roomName,
      participents: userIds,
    });
    return room;
  };
  static createPrivateMessage = async (req, res) => {
    const { receiverId } = req.params;

    try {
      const user = await User.findById(receiverId);
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }
      const room = await ChatController.getOrCreateRoomName(
        req.user.id,
        receiverId
      );

      if (receiverId == req.user.id) {
        return res
          .status(400)
          .send(new ErrorApiResponse('Reveiver and sender id cant be same'));
      }
      const chatMsg = await Chat.create({
        sender: req.user.id,
        receiver: receiverId,
        message: req.body.message,
        room: room.room,
      });
      return res.status(201).send(
        new SuccessApiResponse({
          message: 'Chat created successfully',
          data: chatMsg,
        })
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static listLastMsgWithUsers = async (req, res) => {
    try {
      const rooms = await Room.find({
        participents: { $in: req.user.id },
      });
      console.log('rooms ===', rooms);

      const lastMessagesPromises = rooms.map(async (item) => {
        const chat = await Chat.findOne({
          room: item.room,
        }).sort('-createdAt');
        console.log('chat===', chat);
        if (chat != null) {
          return chat;
        }
      });

      const lastMessages = await Promise.all(lastMessagesPromises);

      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Ok',
          data: lastMessages,
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listAllMessages = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (req.user.id == userId) {
        return res.status(400).send(new ErrorApiResponse('Cant user own id'));
      }
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }
      const room = await ChatController.getOrCreateRoomName(
        req.user.id,
        userId
      );
      const filter = {
        room: room.room,
        isRead: false,
        receiver: req.user.id,
        sender: userId,
      };
      console.log('filter==', filter);

      // const updatedData = await Chat.updateMany(
      // {
      //   room: room.name,
      //   isRead: false,
      //   receiver: req.user._id,
      //   sender: user._id,
      // },
      //   {
      //     $set: {
      //       isRead: true,
      //     },
      //   }
      // );
      const updatedData = await Chat.updateMany(
        filter,
        { isRead: true },
        { new: true }
      );
      console.log('updatedData==', updatedData);
      const messages = await Chat.find({ room: room.room });
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Messages fetched successfully',
          data: messages,
        })
      );
    } catch (error) {
      console.log('error==', error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listUserToChat = async (req, res) => {
    const searchFields = ['userName', 'email'];
    let filterQuery = { _id: { $nin: req.user.id } };
    let sq = prepareSearchQuery(req, searchFields);
    if (sq) {
      filterQuery = { ...filterQuery, ...sq };
    }

    const query = User.find(filterQuery, { password: 0 });
    try {
      const { data, count } = await paginate({
        req,
        model: User,
        filterQuery,
        query,
      });
      return res.status(200).send(
        new SuccessApiResponse({
          data: data,
          message: 'User fetched successfully',
        })
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send(new ErrorApiResponse());
    }
  };
}
