// utils/notification.ts
import * as PushAPI from "@pushprotocol/restapi";

export const formatNotificationTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const getCAIPAddress = (address: string, chainId: number = 5): string => {
  return `eip155:${chainId}:${address}`;
};

export const subscribeToChannel = async (
  signer: any,
  userAddress: string,
  channelAddress: string
) => {
  try {
    await PushAPI.user.subscribe({
      signer,
      channelAddress,
      userAddress: getCAIPAddress(userAddress),
      onSuccess: () => console.log('Subscription successful'),
      onError: () => console.error('Subscription failed'),
      env: 'staging'
    });
  } catch (error) {
    console.error('Error subscribing to channel:', error);
  }
};
