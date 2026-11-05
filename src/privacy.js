import { createContext, useContext } from 'react';
import { inr, inrSigned, inrShort } from './utils/helpers';

// "Hide amounts": components that read money through useMoney() show a mask instead
export const PrivacyContext = createContext(false);

const MASK = '₹ ••••';
const shown = { hidden: false, inr, inrSigned, inrShort };
const hidden = { hidden: true, inr: () => MASK, inrSigned: () => MASK, inrShort: () => '•••' };

export const useMoney = () => (useContext(PrivacyContext) ? hidden : shown);
