import { WalletStandardProvider } from '@wallet-standard/react';
import { ConnectionStatusProvider } from './ConnectionStatus';
import type { FC, ReactNode } from 'react';

export const ConnectContext: FC<{ children: NonNullable<ReactNode> }> = ({ children }) => {
    return (
        <WalletStandardProvider>
            <ConnectionStatusProvider>{children}</ConnectionStatusProvider>
        </WalletStandardProvider>
    );
};