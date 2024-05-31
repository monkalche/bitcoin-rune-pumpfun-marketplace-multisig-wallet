import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/UserContext'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
export default function Sellandbuy() {

    const appContext = useContext(AppContext)
    const navigate = useNavigate();
    const [buyModal, setBuyModal] = useState(false);
    const [sellModal, setSellModal] = useState(false);
    const [amount, setAmount] = useState<number>(0)
    const [sellPrice, setSellPrice] = useState<number>(0.00001);
    const [buyPrice, setBuyPrice] = useState<number>(0.00001);

    const [totalSellPrice, setTotalSellPrice] = useState<number>(0)
    const updateTotalSellPrice = (amount: number, price: number) => {
        setTotalSellPrice(amount * price);
    };
    const [totalBuyPrice, setTotalBuyPrice] = useState<number>(0);

    const updateTotalBuyPrice = (amount: number, price: number) => {
        setTotalBuyPrice(amount * price);
    };
    const [retailPrice, setRetailPrice] = useState<number>(0.00003)
    const [sellPriceError, setSellPriceError] = useState("")
    const [amountError, setAmountError] = useState("")
    const [runeToken, setRuneToken] = useState<any>()
    const [runeTokens, setRuneTokens] = useState<any>()
    const { id, remainAmount, price } = useParams()

    const handleSell = async () => {
        setSellModal(true)
        const payload = {
            runeName: id,
            runeAmount: amount,
            action: 1,
        };
        console.log(payload);
        try {
            const response = await axios.post('http://localhost:4000/api/dashboard/get-update-value', payload);
            console.log('Success:', response.data);
            console.log("sdfsdf", response.data.tokenBalance);
            const newSellPrice=Number(((response.data.tokenBalance)/(10**8)).toFixed(8))
            setSellPrice(newSellPrice)
        } catch (error) {
            console.error('Failed to confirm purchase:', error);
        }



    }
    const handleBuy = async () => {
        setBuyModal(true)
        const payload = {
            runeName: id,
            runeAmount: amount,
            action: 0,
        };
        console.log(payload);
        try {
            const response = await axios.post('http://localhost:4000/api/dashboard/get-update-value', payload);
            console.log('Success:', response.data);
            const newBuyPrice=Number(((response.data.tokenBalance)/(10**8)).toFixed(8))
            console.log("newbalance",newBuyPrice);
            setBuyPrice(newBuyPrice)
            // setBuyPrice()
            console.log(response.data.tokenBalance);
        } catch (error) {
            console.error('Failed to confirm purchase:', error);
        }
    }

    const closeHandle = async () => {
        setSellModal(false);
        setBuyModal(false);
    }

    const handleSellConfirm = () => {

    }
    const handleBuyConfirm = async () => {


    }

    const handleCancel = () => {
        setBuyModal(false);
        setSellModal(false)
    }

    const handleChange = (e: any) => {
        const newValue = e.target.value;

        if (/^[1-9]\d*$/.test(newValue) || newValue === '') {
            setAmount(newValue);
            updateTotalSellPrice(newValue, sellPrice)
            updateTotalBuyPrice(newValue,  buyPrice)
            console.log("sellprice",totalSellPrice);
            console.log(totalBuyPrice);
            
            setAmountError("")
        } else {
            setAmountError("please enter only Positive Integer")
        }

    }
    const handleSellPrice = (event: any) => {
        let newValue = event.target.value;
        // Strip leading zeros and re-validate
        newValue = newValue.replace(/^0+/, '');
        if (newValue === '') {
            newValue = '0.00001'; // Set to '0' if empty after strip to maintain a valid number
        }
        setSellPrice(newValue);
        updateTotalSellPrice(amount, newValue)
        console.log(totalSellPrice);

        validateSellPrice(newValue)

    }
    const validateSellPrice = (value: any) => {
        const num = parseFloat(value);
        // Check if the number is non-negative and is a valid number
        if (num >= 0 && !isNaN(num)) {
            setSellPriceError(''); // Clear any previous error messages
        } else {
            setSellPriceError('Please enter a non-negative number.');
        }
    }

    const handleNavigate = () => {
        navigate(-1)
    }

    const findTokenByName = (name: any) => {
        return runeTokens.find((token: { name: any; }) => token.name === name);
    }


    useEffect(() => {
    }, [id]);

    return (
        <div className='flex flex-col items-center justify-between w-full min-h-screen p-4'>
            <div></div>
            <div className='flex items-center justify-center'>
                <h1 className='text-white justify-center font-semibold leading-7 text-[32px]'> Trade your Runes</h1>
            </div>
            <div
                className='justify-center border-2 border-[#252B35]  text-center  p-3 w-[350px] rounded-xl bg-[#131417] gap-1 cursor-pointer'
            >
                <p className='text-white text-sm'>Rune Name: {(id as string).toLocaleUpperCase().replaceAll(".", "•")}</p>
                <p className='text-white text-sm'>Remain Amount: {remainAmount}</p>
                <p className='text-white text-sm'>Current Price: {price}</p>
                {/* <p className='text-white text-sm'>Symbol: {symbol}</p> */}
            </div>
            <div className='flex flex-wrap items-center justify-center gap-4 '>
                <p className='text-white font-semibold leading-6 text-[20px]'>The amount of Runes:</p>
                <div className='flex flex-col gap-2'>
                    <input className="bg-[#16171B]  placeholder:text-gray-600 py-2 px-4 text-white border-2 border-[#252B35] rounded-2xl"
                        placeholder="amount"
                        value={amount}
                        required
                        style={{ borderColor: amountError ? 'red' : 'green' }}
                        onChange={handleChange}
                        type="number"
                    />
                    {amountError && <p style={{ color: 'red' }}>{amountError}</p>}
                </div>
                <div className='flex flex-row gap-4 items-center'>
                    <button
                        className="bg-[#1665FF] rounded-xl px-6 py-2 w-full hover:bg-blue-700"
                        type="button"
                        onClick={handleBuy}
                    ><p className="text-[14px] text-white font-semibold leading-6">Buy</p>
                    </button>
                    <button
                        className="bg-[#1665FF] rounded-xl px-6 py-2 w-full hover:bg-blue-700"
                        type="button"
                        onClick={handleSell}
                    ><p className="text-[14px] text-white font-semibold leading-6">Sell</p>
                    </button>

                    {sellModal ? (
                        <div className='flex  items-center  fixed inset-0 '>
                            <div className="mx-auto border-2 border-solid border-gray-700 rounded-xl">
                                <div className="bg-[#252B35] flex flex-row justify-between px-4 py-5 border-b-2 border-solid border-gray-700 gap-20">
                                    <div></div>
                                    <h3 className="text-[20px] font-semibold font-menrope text-white leading-[30px]">Do you really wanna sell? </h3>
                                    <button onClick={() => closeHandle()}>
                                        <img src="../assets/close.png" />
                                    </button>
                                </div>


                                <div className="bg-[#252B35]">
                                    <div className="bg-[#252B35] gap-4  rounded-xl px-4 py-3 w-full">
                                        <p className="block text-[14px] leading-6 text-white  mb-1">
                                            You' ll sell <span className='text-[16px] text-green-500'>{amount}</span> Runes
                                        </p>

                                        <p className="block text-[14px] text-white pt-3 mb-1 gap-4">The sell price is {sellPrice}</p>
                                        <p className="block text-[14px] text-white pt-3 mb-1 gap-4">
                                            The total amount that you'll earn comes to <span className='text-[16px] text-green-500' >{totalSellPrice}</span> BTC
                                        </p>

                                    </div>

                                </div>
                                <div className="flex jsutify-between bg-[#252B35] justify-center p-4 gap-2">
                                    <div></div>
                                    <div className='flex flex-row gap-2'>
                                        <button
                                            className="bg-green-500 rounded-xl p-2 hover:bg-green-700"
                                            type="button"
                                            onClick={handleSellConfirm}
                                        ><p className="text-[14px] text-white font-semibold leading-6">Confirm</p>
                                        </button>
                                        <button
                                            className="bg-red-700 rounded-xl px-3 py-2  hover:bg-red-500"
                                            type="button"
                                            onClick={handleCancel}
                                        ><p className="text-[14px] text-white font-semibold leading-6">Cancel</p>
                                        </button>

                                    </div>
                                </div>

                            </div></div>
                    ) : (null)}

                    {buyModal ? (
                        <div className='flex  items-center  fixed inset-0 '>
                            <div className="mx-auto border-2 border-solid border-gray-700 rounded-xl ">
                                <div className="bg-[#252B35] flex flex-row justify-between px-4 py-5 border-b-2 border-solid border-gray-700 gap-20">

                                    <h3 className="text-[24px] font-semibold font-menrope text-white leading-[30px]">Do you really wanna buy? </h3>
                                    <button onClick={() => closeHandle()}>
                                        <img src="../assets/close.png" />
                                    </button>
                                </div>
                                <div className="bg-[#252B35]">
                                    <div className=" rounded-xl px-4 py-3 w-full ">
                                        <div className='flex flex-col flex-wrap gap-4'>
                                            <div>
                                                <p className="block text-[20px] leading-6 text-white  mb-1">
                                                    You' ll buy <span className='text-[16px] text-green-500'>{amount}</span> Runes
                                                </p>
                                            </div>
                                            <div>
                                                <p className="block text-[20px] leading-6 text-white  mb-1">
                                                    You'll buy Rune for <span className='text-[16px] text-green-500'>{buyPrice}</span> BTC
                                                </p>
                                            </div>
                                            <div>
                                                <p className="block text-[20px] leading-6 text-white mb-1 ">
                                                    The total price  comes to <span className='text-[16px] text-green-500'>{Number(totalBuyPrice.toString().substring(0, 8))}</span> BTC
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex justify-between bg-[#252B35]  p-2 gap-2">
                                    <div></div>
                                    <div className='flex flex-row gap-2'>
                                        <button
                                            className="bg-green-700 rounded-xl p-2 hover:bg-green-500"
                                            type="button"
                                            onClick={handleBuyConfirm}
                                        ><p className="text-[14px] text-white font-semibold leading-6">Confirm</p>
                                        </button>
                                        <button
                                            className="bg-red-700 rounded-xl py-2 px-3 hover:bg-red-500"
                                            type="button"
                                            onClick={handleCancel}
                                        ><p className="text-[14px] text-white font-semibold leading-6">Cancel</p>
                                        </button>
                                    </div>
                                </div>

                            </div></div>
                    ) : (null)}
                </div>
            </div>
            <div className='flex justify-center'>
                <button
                    className="bg-[#1665FF] rounded-xl px-6 py-2  hover:bg-blue-700"
                    type="button"
                    onClick={handleNavigate}
                ><p className="text-[24px] text-white font-semibold leading-7">Back</p>
                </button>
            </div>
        </div >
    )
}
