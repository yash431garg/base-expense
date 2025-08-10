
import React, { useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { supabase } from '~/lib/supabas';
import { v4 as uuidv4 } from 'uuid';


interface Friend {
    id: string;
    name: string;
    email?: string;
}

interface PaymentRequest {
    id: string;
    description: string;
    totalAmount: number;
    splitAmount: number;
    createdBy: string;
    friends: Friend[];
    paidBy: string[];
    status: 'pending' | 'completed';
}

export default function BillSplitApp({ address }: { address: string }) {
    const { context, isSDKLoaded } = useMiniApp();
    const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
    
    // Debug logging
    console.log('BillSplit - context:', context);
    console.log('BillSplit - isSDKLoaded:', isSDKLoaded);
    console.log('BillSplit - user fid:', context?.user?.fid);
    const [totalAmount, setTotalAmount] = useState('');
    const [description, setDescription] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [newFriendName, setNewFriendName] = useState('');
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    // Add friend to split
    const addFriend = () => {
        if (newFriendName.trim()) {
            const newFriend: Friend = {
                id: Date.now().toString(),
                name: newFriendName.trim(),
            };
            setFriends([...friends, newFriend]);
            setNewFriendName('');
        }
    };

    // Remove friend from split
    const removeFriend = (id: string) => {
        setFriends(friends.filter(f => f.id !== id));
    };

    // Create payment request
    const createPaymentRequest = async () => {
        if (!totalAmount || !description || friends.length === 0) return;
        const id = uuidv4();
        const splitAmount = parseFloat(totalAmount) / (friends.length + 1); // +1 for creator
        const newRequest = {
            id,
            description,
            total_amount: parseFloat(totalAmount),
            split_amount: splitAmount,
            created_by: 'You',   // ✅ snake_case to match DB column exactly
            friends,             // jsonb column
            paid_by: [],         // jsonb column
            status: 'pending',
            address
        };

        const data = await supabase
            .from('payment_requests')
            .insert([newRequest]);

        if (data?.error) {
            console.error('Insert error:', data?.error);
        } else {
            console.log('Inserted request:', data);
        }


        // console.log(data)

        // setPaymentRequests([...paymentRequests, newRequest]);
        console.log(data)
        // Reset form
        setLastCreatedId(id); // ✅ store the ID
        setTotalAmount('');
        setDescription('');
        setFriends([]);
        setActiveTab('requests');
    };



    return (
        <div className="max-w-md mx-auto max-h-80 bg-gray-900 text-gray-100 overflow-scroll">
            {/* Header */}

            {/* Wallet Connection Notice */}
            {!context?.user?.fid && (
                <div className="bg-yellow-900 border border-yellow-700 p-3 text-yellow-200 text-sm">
                    <p className="font-medium mb-1">Farcaster Not Connected</p>
                    <p>Please connect your Farcaster account to use this app.</p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'create'
                        ? 'border-b-2 border-blue-400 text-blue-400'
                        : 'text-gray-400'
                        }`}
                >
                    Create Request
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'requests'
                        ? 'border-b-2 border-blue-400 text-blue-400'
                        : 'text-gray-400'
                        }`}
                >
                    My Requests ({paymentRequests.length})
                </button>

            </div>

            {/* Create Tab */}
            {activeTab === 'create' && (
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            What's this for?
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Dinner at restaurant, groceries, etc."
                            className="w-full p-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Total Amount ($)
                        </label>
                        <input
                            type="number"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full p-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Split with friends
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newFriendName}
                                onChange={(e) => setNewFriendName(e.target.value)}
                                placeholder="Friend's name"
                                className="flex-1 p-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && addFriend()}
                            />
                            <button
                                onClick={addFriend}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>

                        {friends.length > 0 && (
                            <div className="space-y-2">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="flex items-center justify-between bg-gray-800 p-2 rounded"
                                    >
                                        <span>{friend.name}</span>
                                        <button
                                            onClick={() => removeFriend(friend.id)}
                                            className="text-red-400 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {totalAmount && friends.length > 0 && (
                        <div className="bg-blue-900 p-3 rounded-lg">
                            <h3 className="font-medium text-blue-300 mb-2">Split Preview</h3>
                            <p className="text-sm text-blue-200">
                                Each person pays:{' '}
                                <span className="font-bold">
                                    ${(parseFloat(totalAmount) / (friends.length + 1)).toFixed(2)}
                                </span>
                            </p>
                            <p className="text-xs text-blue-300 mt-1">
                                Total: ${totalAmount} ÷ {friends.length + 1} people
                            </p>
                        </div>
                    )}

                    <button
                        onClick={createPaymentRequest}
                        disabled={!totalAmount || !description || friends.length === 0}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                        Create Payment Request
                    </button>
                    {lastCreatedId && (
                        <div className="mt-4 flex items-center gap-2 bg-gray-800 p-3 rounded">
                            <span className="text-sm text-gray-200">ID: {lastCreatedId}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(lastCreatedId);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="p-4">
                    {paymentRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>No payment requests yet</p>
                            <p className="text-sm">Create your first bill split!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paymentRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="border border-gray-700 rounded-lg p-4 bg-gray-800"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-100">{request.description}</h3>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${request.status === 'completed'
                                                ? 'bg-green-900 text-green-200'
                                                : 'bg-yellow-900 text-yellow-200'
                                                }`}
                                        >
                                            {request.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-300 mb-3">
                                        <p>Total: ${request.totalAmount.toFixed(2)}</p>
                                        <p>Your share: ${request.splitAmount.toFixed(2)}</p>
                                        <p>Split between: {request.friends.length + 1} people</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>You (Creator)</span>
                                            <span className="text-green-400">✓ Paid</span>
                                        </div>
                                        {request.friends.map((friend) => (
                                            <div key={friend.id} className="flex items-center justify-between text-sm">
                                                <span>{friend.name}</span>
                                                {request.paidBy.includes(friend.id) ? (
                                                    <span className="text-green-400">✓ Paid</span>
                                                ) : (
                                                    <span className="text-orange-400">Pending</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                        <button className="w-full py-2 bg-blue-900 text-blue-200 rounded text-sm font-medium hover:bg-blue-800">
                                            Share Payment Link
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}


