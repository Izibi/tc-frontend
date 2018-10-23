
import * as Immutable from 'immutable';

import {BlockInfo} from '../types';

/* Types of entities as they are received from the backend. */

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
    accessCode: string,
    contestId: string,
    isOpen: boolean,
    isLocked: boolean,
    name: string,
    publicKey: string,
  },
  "members": {
    memberIds: string[],
  },
  "!": {
    isOpen: boolean,
    publicKey: string,
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
}

export type PreGameInfo = {
  game: PreGame,
  blocks: Immutable.List<BlockInfo>,
}

export type BackendState = {
  backend: {
    generation: number,
    lastError: string | undefined,
    tasks: object[],
  },
  eventSource: {
    key: string,
    channels: string[],
  },
  entities: PreEntities,
  games: Immutable.Map<string, PreGameInfo>,
}
