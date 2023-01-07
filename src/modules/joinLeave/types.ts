import { JoinLeaveData } from '$lib/types/messageBuilder';

export interface RawServerJoin {
  joinMessage?: JoinLeaveData;
  joinChannel?: string;
}

export interface RawServerLeave {
  leaveMessage?: JoinLeaveData;
  leaveChannel?: string;
}
