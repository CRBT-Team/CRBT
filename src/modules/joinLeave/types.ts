import { JoinLeaveData } from '../components/MessageBuilder/types';

export const resolveMsgType = {
  JOIN_MESSAGE: 'joinMessage',
  LEAVE_MESSAGE: 'leaveMessage',
};

export interface RawServerJoin {
  joinMessage?: Omit<JoinLeaveData, 'type'>;
  joinChannel?: string;
}

export interface RawServerLeave {
  leaveMessage?: Omit<JoinLeaveData, 'type'>;
  leaveChannel?: string;
}
