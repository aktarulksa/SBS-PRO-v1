export interface Country {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
  flagEmoji: string;
  currency: string;
  currencySymbol: string;
}

export interface DrivePackage {
  id: string;
  title: string;
  data: string;
  minutes: string;
  validity: string;
  regularPrice: number;
  cashback: number;
  offerPrice: number;
  division?: string;
}

export interface Operator {
  id: string;
  countryId: string;
  name: string;
  shortCode: string;
  code: string;
  color: string;
  textColor?: string;
  prefixes: string[];
  packages?: DrivePackage[];
}

export interface FinancialService {
  id: string;
  name: string;
  code: 'bkash' | 'rocket' | 'nagad' | 'upay' | 'mcash';
  accentColor: string;
  iconType: string;
  operations: ('cash_in' | 'cash_out' | 'send_money' | 'merchant_pay')[];
}

export interface UtilityProvider {
  id: string;
  name: string;
  category: 'electricity' | 'water' | 'gas' | 'internet' | 'tv';
  shortCode: string;
  fee: number;
}

export type TransactionType = 'recharge' | 'mfs' | 'bill_pay' | 'drive' | 'balance_request';
export type TransactionStatus = 'Success' | 'Pending' | 'Failed' | 'Rejected';

export type UserRole = 'admin' | 'agent';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string;
  phone?: string;
  email?: string;
  balance: number;
  status: 'active' | 'suspended';
  joinedDate: string;
}

export interface Transaction {
  id: string;
  trxId: string;
  type: TransactionType;
  category: string;
  serviceName: string;
  operatorShortCode?: string;
  operatorColor?: string;
  accountOrPhone: string;
  accountType?: 'Prepaid' | 'Postpaid' | 'Skitto' | 'Personal' | 'Agent';
  amount: number;
  fee: number;
  cost: number;
  commission: number;
  status: TransactionStatus;
  timestamp: string;
  customerName?: string;
  note?: string;
  agentId?: string;
  agentName?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface WalletState {
  mainBalance: number;
  driveBalance: number;
  bankBalance: number;
  todayProfit: number;
  totalRechargesToday: number;
}

export type ActiveTab = 'RECHARGE' | 'QUEUE' | 'REPORTS' | 'PROFILE' | 'CHANGE PIN' | 'ADMIN APPROVALS' | 'AGENTS';

