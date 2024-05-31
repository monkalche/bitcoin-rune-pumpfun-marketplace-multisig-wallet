import { createContext, useState } from "react";

interface ContextState {
  profileId: string ;
  paymentAddress: string ;
  ordinalsAddress: string ;
  paymentPublickey: string;
  ordinalsPublickey: string;
  userWallet: string ;
  paymentDerivationPath: string ;
  ordinalDerivationPath: string ;
  walletType: string;
  connectedWalletName: string;
  updateProfileId: (id: string) => void;
  updatePaymentAddress: (address: string) => void;
  updateOrdinalsAddress: (address: string) => void;
  updateUserWallet: (wallet: string) => void;
  updatePaymentDerivationPath: (path: string) => void;
  updateOrdinalDerivationPath: (path: string) => void;
  updateWalletType: (type: string) => void;
  updateConnectedWalletName: (name: string) => void;
  updatePaymentPublickey: (name: string) => void;
  updateOrdinalsPublickey: (name: string) => void;
}

export const AppContext = createContext<ContextState | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {

  const [profileId, setProfileId] = useState<string>(() => {
    const storedProfileId = localStorage.getItem('profileId');
    return  storedProfileId as string;
  });

  const [paymentAddress, setPaymentAddress] = useState<string>(() => {
    const storedPaymentAddress = localStorage.getItem('paymentAddress');
    return storedPaymentAddress as string;
  });

  const [ordinalsAddress, setOrdinalsAddress] = useState<string>(() => {
    const storedOrdinalsAddress = localStorage.getItem('ordinalsAddress');
    return storedOrdinalsAddress as string
  });

  const [paymentPublickey, setPaymentPublickey] = useState<string > (() => {
    const storedPaymentPublickey = localStorage.getItem('paymentPublickey');
    return storedPaymentPublickey as string
  })

  const [ordinalsPublickey, setOrdinalsPublickey] = useState<string  > (() => {
    const storedOrdinalsPublickey = localStorage.getItem('ordinalsPublickey');
    return storedOrdinalsPublickey as string
  })

  const [userWallet, setUserWallet] = useState<string >(() => {
    const storedUserWallet = localStorage.getItem('userWallet');
    return storedUserWallet as string
  });

  const [paymentDerivationPath, setPaymentDerivationPath] = useState<string >(() => {
    const storedPaymentDerivationPath = localStorage.getItem('paymentDerivationPath');
    return storedPaymentDerivationPath as string
  });

  const [ordinalDerivationPath, setOrdinalDerivationPath] = useState<string >(() => {
    const storedOrdinalDerivationPath = localStorage.getItem('ordinalDerivationPath');
    return storedOrdinalDerivationPath as string
  });

  const [walletType, setWalletType] = useState<string >(() => {
    const storedWalletType = localStorage.getItem('walletType');
    return storedWalletType as string
  });

  const [connectedWalletName, setConnectedWalletName] = useState<string >(() => {
    const storedConnectedWalletName = localStorage.getItem('connectedWalletName');
    return storedConnectedWalletName as string
  });

  const updateProfileId = (id: string) => {
    setProfileId(id);
    localStorage.setItem('profileId', id);
  };
  const updatePaymentAddress = (address: string) => {
    setPaymentAddress(address);
    localStorage.setItem('paymentAddress', address);
  };
  const updateOrdinalsAddress = (address: string) => {
    setOrdinalsAddress(address);
    localStorage.setItem('ordinalsAddress', address);
  };

  const updatePaymentPublickey=(pubkey:string)=>{
    setPaymentPublickey(pubkey);
    localStorage.setItem('paymentPublickey', pubkey)
  }
  const updateOrdinalsPublickey=(pubkey:string)=>{
    localStorage.setItem('ordinalsPublickey', pubkey)
  }
  const updateUserWallet = (wallet: string) => {
    setUserWallet(wallet);
    localStorage.setItem('userWallet', wallet);
  };
  const updatePaymentDerivationPath = (path: string) => {
    setPaymentDerivationPath(path);
    localStorage.setItem('paymentDerivationPath', path);
  };
  const updateOrdinalDerivationPath = (path: string) => {
    setOrdinalDerivationPath(path);
    localStorage.setItem('ordinalDerivationPath', path);
  };
  const updateWalletType = (type: string) => {
    setWalletType(type);
    localStorage.setItem('walletType', type);
  };
  const updateConnectedWalletName = (name: string) => {
    setConnectedWalletName(name);
    localStorage.setItem('connectedWalletName', name);
  };

  return (
    <AppContext.Provider
      value={{
        profileId,
        paymentAddress,
        ordinalsAddress,
        paymentPublickey,
        ordinalsPublickey,
        userWallet,
        paymentDerivationPath,
        ordinalDerivationPath,
        walletType,
        connectedWalletName,
        updateProfileId,
        updatePaymentAddress,
        updateOrdinalsAddress,
        updateOrdinalsPublickey,
        updatePaymentPublickey,
        updateUserWallet,
        updatePaymentDerivationPath,
        updateOrdinalDerivationPath,
        updateWalletType,
        updateConnectedWalletName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};