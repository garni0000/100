/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error("MetaMask connection failed:", error);
      throw new Error("Failed to connect to MetaMask");
    }
  } else {
    throw new Error("MetaMask is not installed");
  }
}
