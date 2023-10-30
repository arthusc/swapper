import rawNetworks from './networks.json';
import { INetwork } from './types';

export const networks = rawNetworks as INetwork[];
export const networkById = networks.reduce((acc, network) => {
    acc[network.id] = network;
    return acc;
}, {} as Record<string, INetwork>);

export const networkBySlug = networks.reduce((acc, network) => {
    acc[network.slug] = network;
    return acc;
}, {} as Record<string, INetwork>);

export const getNetwork = (network: INetwork|string|number): INetwork => {
    if (typeof network === 'string') {
        return networkBySlug[network];
    }
    if (typeof network === 'number') {
        return networkById[network];
    }
    return network;
}
