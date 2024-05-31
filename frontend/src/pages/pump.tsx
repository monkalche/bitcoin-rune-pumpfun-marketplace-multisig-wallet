import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/UserContext';
import { WalletType } from '../configs/config';
import { useWallets } from '@wallet-standard/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { log } from 'console';
export default function Pump() {

    const appContext = useContext(AppContext)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false);
    const onCloseModal = () => setOpen(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const { wallets } = useWallets();
    const [showEtching, setShowEtching] = useState(false);
    const [runename, setRuneName] = useState<string>();
    const [runeAmount, setRuneAmount] = useState<number>();
    const [runeSymbol, setRuneSymbol] = useState<string>();
    const [initialPrice, setInitialPrice] = useState<number>(0.00001);
    const [imagePreview, setImagePreview] = useState('');
    const [imageData, setImageData] = useState<File | null>(null);
    const [imageContent, setImageContent] = useState<any>();
    const [nameError, setNameError] = useState("");
    const [amountError, setAmountError] = useState("");
    const [symbolError, setSymbolError] = useState("");
    const [initialError, setInitialError] = useState("");
    const [runeTokens, setRuneTokens] = useState<any[]>([])
    const [avatar, setAvatar] = useState({
        preview: "",
        raw: ""
    });
    const handleRuneName = (e: any) => {
        const newValue = e.target.value;
        if (/^[A-Z]*$/.test(newValue)) {
            setRuneName(newValue);
            setNameError("")
        } else {
            setNameError("please entere only uppercase Integer")
        }
    }

    const handleRuneAmount = (e: any) => {
        const newValue = e.target.value;

        if (/^[1-9]\d*$/.test(newValue) || newValue === '') {
            setRuneAmount(newValue);
            setAmountError("")
        } else {
            setAmountError("please enter only Positive Integer")
        }

    }

    const handleRuneSymbol = (e: any) => {
        const newValue = e.target.value;
        if (/^[^a-zA-Z0-9]*$/.test(newValue)) {
            setRuneSymbol(newValue);
            setSymbolError("")
        } else {
            setSymbolError("please enter only special characters")
        }
    }

    const handleInitialPrice = (event: any) => {
        let newValue = event.target.value;
        // Strip leading zeros and re-validate
        newValue = newValue.replace(/^0+/, '');
        if (newValue === '') {
            newValue = '0.00001'; // Set to '0' if empty after strip to maintain a valid number
        }
        setInitialPrice(newValue);
        validateInitialPrice(newValue)

    }

    const validateInitialPrice = (value: any) => {
        const num = parseFloat(value);
        // Check if the number is non-negative and is a valid number
        if (num >= 0 && !isNaN(num)) {
            setInitialError(''); // Clear any previous error messages
        } else {
            setInitialError('Please enter a non-negative number.');
        }
    }
    const connectUnisatWallet = async () => {


        try {
            const accounts = await (window as any).unisat.requestAccounts();
            const pubkey = await (window as any).unisat.getPublicKey();
            appContext?.updatePaymentAddress(accounts[0]);
            appContext?.updateOrdinalsAddress(accounts[0]);
            appContext?.updatePaymentPublickey(pubkey);
            appContext?.updateOrdinalsPublickey(pubkey);
            appContext?.updateWalletType(WalletType.Unisat);
            onCloseModal();
            setWalletOpen(true)
            setOpen(true)
            console.log("click");
        } catch (e) {
            toast.warn("Please install the unisat wallet in your browser");
        }
    };

    const disconnect = () => {
        localStorage.clear();
        appContext?.updatePaymentAddress("")
        appContext?.updatePaymentPublickey("")
        appContext?.updateOrdinalsAddress("")
        appContext?.updateOrdinalsPublickey("")
    }
    const handleEtching = async () => {
        console.log("click");
        setShowEtching(true);
    };

    const handleSubmit = async () => {
        const reqBody = {
            Runename: runename,
            RuneSymbol: runeSymbol,
            RuneAmount: runeAmount,
            InitialPrice: initialPrice,
            iImageContent: imageContent,
        }
        if (!runeAmount || !runename || !runeSymbol || !initialPrice || !imageContent) {
            toast.warning("fill in the each gap")
        }

        if (runeAmount && runename && initialPrice && runeSymbol) {
            try {
                const submitData = await axios.post(`endpoint`, reqBody, {
                    headers: { 'conten-Type': 'appliation/json' }
                })
            } catch (error: any) { }
        }
    }

    const closeHandle = async () => {
        setShowEtching(false);

    }



    const handleRuneTokenClick = (runeTokenId: string, remainAmount: number, price: number) => {
        navigate(`/trade/${runeTokenId}/${remainAmount}/${price}`);
    };

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/dashboard'); // Adjust URL to match your server configuration
                console.log(response.data);
                console.log(response.data.runeList);
                setRuneTokens(response.data.runeList)

            } catch (err) {
                console.error("Failed to fetch rune tokens:", err);
            }
        };

        fetchTokens();
    }, []);

    const handleImageUpload = (event: any) => {
        // if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setImageData(file);
        console.log('imageData==>', imageData);

        const reader = new FileReader();

        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            console.log(e.target?.result as string);

        };
        if (event.target.files.length) {
            setAvatar({
                preview: URL.createObjectURL(event.target.files[0]),
                raw: event.target.files[0],
            });
          console.log(avatar.preview);
           
        } 
        if (file) {
            const reader = new FileReader();

            reader.onload = function () {
                // The result attribute contains the data URL, which is a Base64 string
                const base64String = reader.result as string;
                // Display the Base64 string in a textarea
                console.log(base64String);
                const hexString = base64ToHex(base64String.split(',')[1]);
                console.log(hexString);
                setImageContent(hexString)

            };

            // Read the file as a Data URL (Base64 string)
            reader.readAsDataURL(file);
        }
    }
    const base64ToHex = (base64String: string) => {
        const raw = atob(base64String);
        let result = '';
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += (hex.length === 2 ? hex : '0' + hex);
        }
        return result;
    }

    const runeToken = [
        {
            RuneType: "1",
            RuneId: "se9fjwk0odjeoske0adf",
            Image: "../assets/image.png",
            Property: {
                Runename: "wonder",
                RemainAmount: 45,
                currentPrice: 0.003
            }
        },
        {
            RuneType: "2",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "3",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",

                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",

                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",

                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/Venza.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/Sicee.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/ape.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/me.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/ape.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/Block.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/guest.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
        {
            RuneType: "4",
            RuneId: "d8df9s9d8f8e9s8df9d8",
            Image: "../assets/qweasd.png",
            Property: {
                Runename: "ugly",
                RemainAmount: 45,
                currentPrice: 0.002
            }
        },
    ]


    return (
        <div className='flex flex-col w-full min-h-screen relative gap-4'>
            <div className='flex justify-center'>
                <div className='flex items-center justify-cetner w-[300px] '>
                    {appContext?.paymentAddress ? (
                        <button
                            className="flex flex-row items-center ustify-center bg-[#131417] broder-[#252B35] broder-1  w-full px-4 py-8 rounded-xl gap-2"
                            onClick={() => disconnect()}
                        >
                            <img src="../assets/unisat.jpg" className="w-10 h-10 rounded-md  " />
                            <p className="font-bold text-[16px] leading-5 text-white">Disconnect</p>

                        </button>) :
                        (<button
                            className="flex flex-row items-center ustify-center bg-[#131417] broder-2 broder-[#252B35]  px-4 py-8 rounded-xl gap-2"
                            onClick={() => connectUnisatWallet()}
                        >
                            <img src="../assets/unisat.jpg" className="w-10 h-10 rounded-md  " />
                            <p className="font-bold text-[16px] leading-5 text-white">Connect</p>
                        </button>)}
                    {appContext?.paymentAddress ?
                        (<div className="flex justify-center px-3.5 w-[200px] ">
                            <button
                                className="bg-[#1665FF] rounded-xl px-6 py-3 hover:bg-blue-700"
                                type="button"
                                onClick={handleEtching}
                            ><p className="text-[14px] text-white font-semibold leading-6">Etching</p></button>
                        </div>) :
                        (null)
                    }
                    {showEtching ? (<div className="flex  items-center  fixed inset-0 ">
                        <div className=" mx-auto border-2 border-solid border-gray-700 rounded-xl ">
                            <div className="flex flex-row bg-[#252B35]  justify-between px-4 py-5 border-b-2 border-solid border-gray-700 ">
                                <div></div>
                                <h3 className="text-[20px] font-semibold font-menrope text-white leading-[30px]">Rune Etching</h3>
                                <button onClick={() => closeHandle()}>
                                    <img src="../assets/close.png" />
                                </button>
                            </div>
                            <form encType='multipart/form-data'>

                                <div className="bg-[#252B35]">
                                    <div className="bg-[#252B35] gap-4  rounded-xl px-4 py-3 w-full">
                                        <label className="block text-[14px] leading-6 text-[#637592]  mb-1">
                                            Rune Name
                                        </label>
                                        <input className="bg-[#16171B]  rounded w-full  placeholder:text-gray-600 py-2 px-4 text-white focus:outline-none"
                                            value={runename}
                                            onChange={handleRuneName}
                                            required
                                            style={{ borderColor: nameError ? 'red' : 'green' }}
                                            placeholder="Enter Uppercase Letters" />
                                        {nameError && <p style={{ color: 'red' }}>{nameError}</p>}
                                        <label className="block text-[14px] text-[#637592] pt-3 mb-1 gap-4">
                                            Rune Amount
                                        </label>

                                        <input className="bg-[#16171B]  rounded w-full  placeholder:text-gray-600 py-2 px-4 text-white focus:outline-none"
                                            value={runeAmount}
                                            onChange={handleRuneAmount}
                                            required
                                            min="1"
                                            type='number'
                                            style={{ borderColor: amountError ? 'red' : 'green' }}
                                            placeholder="Enter a number greater thatn 0" />
                                        {amountError && <p style={{ color: 'red' }}>{amountError}</p>}
                                        <label className="block text-[14px] text-[#637592] pt-3 mb-1 gap-4">
                                            Rune Symbol
                                        </label>

                                        <input className="bg-[#16171B]  rounded w-full  placeholder:text-gray-600 py-2 px-4 text-white focus:outline-none"
                                            value={runeSymbol}
                                            required
                                            onChange={handleRuneSymbol}
                                            style={{ borderColor: symbolError ? 'red' : 'green' }}
                                            placeholder="Symbols only (e.g., @, #, %)" />
                                        {symbolError && <p style={{ color: 'red' }}>{symbolError}</p>}
                                        <label className="block text-[14px] text-[#637592] pt-3 mb-1 gap-4">
                                            Initial Price
                                        </label>

                                        <input className="bg-[#16171B]  rounded w-full  placeholder:text-gray-600 py-2 px-4 text-white focus:outline-none"
                                            value={initialPrice}
                                            onChange={handleInitialPrice}
                                            required
                                            style={{ borderColor: initialError ? 'red' : 'green' }}
                                            placeholder="Enter initial price" />
                                        {initialError && <p style={{ color: 'red' }}>{initialError}</p>}
                                        <label className="block text-[14px] text-[#637592] pt-3 mb-1 gap-4">Image</label>
                                        <div className="flex items-center justify-center w-[360px] h-[180px]">
                                            <input name="image"
                                                type="file"
                                                id="upload-button"
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleImageUpload} />
                                            <label htmlFor="upload-button">
                                                {avatar.preview ? (
                                                    <img
                                                        src={avatar.preview}
                                                        alt="Preview"
                                                        width="100px"
                                                        height="100px"
                                                        className="my-10 mx-5"
                                                    />
                                                ) : (
                                                    <>
                                                        <img src="../assets/Input.png" className=" text-white text-1xl text-left w-full" />
                                                        <div />
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex bg-[#252B35] justify-center pb-3 px-3.5">
                                    <button
                                        className="bg-[#1665FF] rounded-xl px-6 py-3  hover:bg-blue-700"
                                        type="button"
                                        onClick={handleSubmit}
                                    ><p className="text-[14px] text-white font-semibold leading-6">Etching</p></button>
                                </div>
                            </form>

                        </div>
                    </div>) : null}



                </div>
            </div>

            {/* Rune  Display*/}
            {appContext?.paymentAddress ? (
                <div className="flex flex-wrap justify-center gap-2">
                    {runeTokens.map((item, index) => (
                        <div key={index}
                            className='justify-center border-2 border-[#252B35]  text-center  p-3 w-[350px] rounded-xl bg-[#131417] gap-1 cursor-pointer'
                            onClick={() => handleRuneTokenClick(item.name, item.remainAmount, item.tokenBalance)}
                        >
                            {/* <img src={`${item.Image}`} className='rounded-lg' width="200px" height="200px" /> */}
                            <p className='text-white text-sm'>Rune Name: {item.name.toLocaleUpperCase().replaceAll(".", "•")}</p>
                            <p className='text-white text-sm'>Symbol: {item.symbol}</p>
                            <p className='text-white text-sm'>Remain Amount: {item.remainAmount}</p>
                            <p className='text-white text-sm'>Current Price: {item.tokenBalance}</p>
                        </div>
                    ))}
                </div>) : (null)}
            <ToastContainer />
        </div>
    )
}
