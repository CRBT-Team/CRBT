import { JoinLeaveData } from '$lib/types/messageBuilder';

export interface RawServerJoin {
  joinMessage?: JoinLeaveData;
  joinChannelId?: string;
}

export interface RawServerLeave {
  leaveMessage?: JoinLeaveData;
  leaveChannelId?: string;
}
