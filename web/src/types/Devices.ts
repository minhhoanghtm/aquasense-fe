export type Devices = {
    id: string;
    pondId: string;
    serialNumber: string;
    macAddress: string;
    status: string;
    lastActiveAt: string;
    createdAt?: string;
    name?: string;
    node_code?: string;
    sensors?: string[];
    connection_type?: string;
    signal_strength?: number;
};