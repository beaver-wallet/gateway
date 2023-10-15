export const RouterABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentNumber",
        type: "uint256",
      },
    ],
    name: "PaymentMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "subscriptionId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "merchantDomain",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "product",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "period",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "paymentPeriod",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
    ],
    name: "SubscriptionStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
    ],
    name: "SubscriptionTerminated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "claimCompensation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "claimFees",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "compensation",
        type: "uint256",
      },
    ],
    name: "makePayment",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "subscriptionId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "merchantDomain",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "product",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "period",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "freeTrialLength",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "paymentPeriod",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "initiator",
        type: "address",
      },
    ],
    name: "startSubscription",
    outputs: [
      {
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "subscriptions",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "subscriptionId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "merchantDomain",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "product",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "period",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "paymentPeriod",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "paymentsMade",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "terminated",
        type: "bool",
      },
      {
        internalType: "address",
        name: "initiator",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "subscriptionHash",
        type: "bytes32",
      },
    ],
    name: "terminateSubscription",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
