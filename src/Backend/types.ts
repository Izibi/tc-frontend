
import * as Immutable from 'immutable';

import {BlockIndexEntry, BlockData} from '../types';

/* Types of entities as they are received from the backend. */

export type Collection = keyof PreEntities;

export type OptimisticChange<K extends Collection> = {
  collection: K,
  id: string,
  change: PreEntities[K][string] extends {"!": infer T} ? T : never
};

export type UserFacets = {
  "": {
    id: string,
    username: string,
    firstname: string,
    lastname: string,
  }
}

export type ContestFacets = {
  "": {
    id: string,
    title: string,
    description: string,
    logoUrl: string,
    registrationOpen: boolean,
    registrationClosesAt: string,
    startsAt: string,
    endsAt: string,
    taskId: string,
    currentPeriodId: string,
  },
  "teams": {
    teamIds: string[],
  }
}

export type TaskFacets = {
  "": {
    id: string,
    title: string,
    createdAt: string,
    updatedAt: string,
  },
  "resources": {
    resourceIds: string[],
  }
}

export type TaskResourceFacets = {
  "": {
    id: string,
    taskId: string,
    rank: number,
    title: string,
    description: string,
    url: string,
    html: string,
  }
}

export type TeamFacets = {
  "": {
    id: string,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string,
    contestId: string,
    isOpen: boolean,
    isLocked: boolean,
    name: string,
    publicKey: string,
  },
  "member": {
    accessCode: string,
  },
  "members": {
    memberIds: string[],
  },
  "!": {
    isOpen?: boolean,
    publicKey?: string,
  }
}

export type TeamMemberFacets = {
  "": {
    teamId: string,
    userId: string,
    joinedAt: string,
    isCreator: boolean,
  }
}

export type ChainFacets = {
  "": {
    id: string,
    createdAt: string,
    updatedAt: string,
    contestId: string,
    ownerId: string | null,
    parentId: string | null,
    statusId: string,
    title: string,
    newProtocolHash: string,
    currentGameKey: string,
    currentRound: number,
    nbVotesApprove: number,
    nbVotesReject: number,
    nbVotesUnknown: number,
  },
  "details": {
    description: string,
    interfaceText: string,
    implementationText: string,
    protocolHash: string,
  },
  "!": {
    statusId?: string,
  }
}

export type PreEntityMap<Facets> = {
  [id: string]: Facets
}

export type PreEntities = {
  users: PreEntityMap<UserFacets>,
  contests: PreEntityMap<ContestFacets>,
  tasks: PreEntityMap<TaskFacets>,
  taskResources: PreEntityMap<TaskResourceFacets>,
  teams: PreEntityMap<TeamFacets>,
  teamMembers: PreEntityMap<TeamMemberFacets>,
  chains: PreEntityMap<ChainFacets>,
}

export type GameHead = {
  game: PreGame,
  page: number,
  blocks: BlockIndexEntry[] | null,
  players: PrePlayer[],
  scores: string | undefined,
}

export type PreGameInfo = {
  game: PreGame,
  players: PrePlayer[],
  blocks: Immutable.List<BlockIndexEntry>,
}

export type PreGame = {
  key: string,
  createdAt: string,
  updatedAt: string,
  startedAt: string | null,
  roundEndsAt: string | null,
  ownerId: string,
  isLocked: boolean,
  firstBlock: string,
  lastBlock: string,
  currentRound: number,
  nbCyclesPerRound: number,
  nbPlayers: number,
  nbRounds: number,
}

export type PrePlayer = {
  rank: number,
  teamId: string,
  botId: number,
}

export type BackendState = {
  backend: {
    loggedOut: boolean,
    generation: number,
    lastError: string | undefined,
    tasks: object[],
    entities: PreEntities,
    pristineEntities: PreEntities,
    optimisticChanges: OptimisticChange<Collection>[],
    games: Immutable.Map<string, PreGameInfo>,
    blocks: Immutable.Map<string, BlockData>,
  },
  eventSource: {
    key: string,
    channels: string[],
  },
}
