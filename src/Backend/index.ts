
import {Effect} from 'redux-saga';
import {fork, call, put, cancelled} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, AppToaster, State} from '../app';

import {EntityMap, Entities, EntitiesUpdate, User, Team, TeamMember, Contest, Task, TaskResource, ContestPeriod, Chain} from './types';
import * as _selectors from './selectors';
import {loadedEntity} from './entities';

export {EntityMap, BackendState, EntitiesUpdate} from './types';
export {default as BackendFeedback} from './Feedback';
export const selectors = _selectors;

type Saga = IterableIterator<Effect>

const keysOf = (Object.keys as <T>(o: T) => (keyof T)[]);

function loadEntities<T extends {id: string}>(values: T[]) : EntityMap<T> {
  const result: EntityMap<T> = {};
  for (let value of values) {
    const {id} = value;
    result[id] = loadedEntity(id, value);
  }
  return result;
}
function loadEntities2<T>(values: T[], getId: (value: T) => string) : EntityMap<T> {
  const result: EntityMap<T> = {};
  for (let value of values) {
    const id = getId(value);
    result[id] = loadedEntity(id, value);
  }
  return result;
}

const testUsers = loadEntities<User>([
  {
    id: "1",
    username: "alice",
    firstname: "Alice",
    lastname: "Doe"
  },
  {
    id: "2",
    username: "bob",
    firstname: "Bob",
    lastname: "Smith"
  },
  {
    id: "3",
    username: "Test User",
    firstname: "Test",
    lastname: "User",
  }
]);
const testContests = loadEntities<Contest>([
  {
    id: "1",
    title: "Contest name",
    description: "Lorem ipsum blah blah",
    logo_url: "",
    registration_open: true,
    registration_closes_at: '2018-09-05',
    starts_at: '2018-09-05',
    ends_at: '2018-09-10',
    task_id: '1',
    current_period_id: '1',
  }
]);
const testTasks = loadEntities<Task>([
  {
    id: "1",
    title: "task 1",
  }
]);
const testContestPeriods = loadEntities<ContestPeriod>([
  {
    id: "1",
    title: "day 1",
    day_number: 1,
    chain_election_at: '2018-09-05T18:00',
    main_chain_id: "1",
  }
]);
const testChains = loadEntities<Chain>([
  {
    id: "1",
    contest_id: "1",
    team_id: null,
    parent_id: null,
    created_at: "2018-09-04T23:59",
    updated_at: "2018-09-04T23:59",
    status: "main",
    nb_votes_reject: 0,
    nb_votes_unknown: 0,
    nb_votes_approve: 0,
    title: "day 1",
    description: "Main chain for day 1",
    interface: "val setup_game : security_token -> unit\nval setup_round : security_token -> unit\nval start_skeleton : int * int -> unit\nval grow_skeleton : int * int -> unit\nval echo : string -> unit",
    implementation: "let setup_game token =\n  let map_side = Task.get_map_side () in\n  let edge_distance = Task.get_edge_distance () in\n  let nb_players = Task.get_nb_players () in\n  Format.printf \"setup %d %d %d\\n\" map_side edge_distance nb_players;\n  let length_edge = edge_distance * 4 in\n  let spacing = float_of_int length_edge /. float_of_int nb_players in\n  let float_pos = ref (spacing /. 2.) in\n  let wrap_pos pos = if pos < map_side then pos else map_side * 2 - 2 - pos in\n  for i_player = 1 to nb_players do\n    Task.set_current_player token i_player;\n    let pos = int_of_float (floor !float_pos) in\n    let x = wrap_pos pos in\n    let pos_shifted = (pos + edge_distance) mod length_edge in\n    let y = wrap_pos pos_shifted in\n    Format.printf \"Player %d at (%d, %d)\\n\" i_player x y;\n    if not (Task.try_start_skeleton (x, y)) then (\n      Format.printf \"  FAILED\\n\"\n    );\n    float_pos := !float_pos +. spacing\n  done\n\nlet setup_round token =\n  ()\n\nlet start_skeleton (x, y) =\n  try\n    if Task.try_start_skeleton (x, y) then\n      print_string \"start_skeleton succeeded\\n\"\n    else\n      print_string \"start_skeleton returned false\\n\"\n  with ex ->\n    print_string \"start_skeleton raised an exception\";\n    print_string (Printexc.to_string ex);\n    print_string \"\\n\"\n\nlet grow_skeleton (x, y) =\n  try\n    if Task.try_grow_skeleton (x, y) then\n      print_string \"grow_skeleton succeeded\\n\"\n    else\n      print_string \"grow_skeleton returned false\\n\"\n  with ex ->\n    print_string \"grow_skeleton raised an exception\";\n    print_string (Printexc.to_string ex);\n    print_string \"\\n\"\n\nlet echo s =\n  print_string s;\n  print_string \"\\n\"",
    protocol_hash: "L1U6RMCSIECKRWwHym1nQX2LR6M",
    new_protocol_hash: "L1U6RMCSIECKRWwHym1nQX2LR6M",
    current_game_key: "h71FDXsQJHda49P9SyBs-hsJzyrpfjJzzZDG3Q7osww",
    current_block_hash: "Jo-rex0xrEz8Q3I2kP-S7002Pcs",
    current_round: 1,
  }
]);
const testTaskResources = loadEntities<TaskResource>([
  {id: "1", task_id: "1", rank: 1, title: "Task description", description: "This section describes the task", url: null, html: "Task description goes <p>here</p>..."},
  {id: "2", task_id: "1", rank: 2, title: "Commands", description: "", url: null, html: "Commands description goes here…"},
  {id: "3", task_id: "1", rank: 3, title: "API", description: "", url: "about:blank#2", html: null},
  {id: "4", task_id: "1", rank: 4, title: "Examples", description: "", url: "about:blank#3", html: null},
  {id: "5", task_id: "1", rank: 5, title: "OCaml basics", description: "", url: "about:blank#4", html: null},
]);
const testTeams = loadEntities<Team>([
  {
    id: "1",
    created_at: "2018-09-01",
    access_code: "ab824XbsI9",
    contest_id: "1",
    is_open: true,
    is_locked: false,
    name: "CodersPlanet",
    public_key: "sCnGFS3n7TX9Y9dZ2ZQ63/rLtB02iEGlySRDSg/DgcM=.ed25519",
  }
]);
const testTeamMembers = loadEntities2<TeamMember>([
  {
    team_id: "1",
    user_id: "1",
    is_creator: true,
    joined_at: '2018-09-05T08:00',
  }
], (value: {team_id: string, user_id: string}) => `${value.team_id} ${value.user_id}`);

export function backendReducer (state: State, action: Actions): State {
  switch (action.type) {

    case ActionTypes.BACKEND_TASKS_CLEARED: {
      return {...state, backend: {generation: 0, tasks: [], lastError: undefined}};
    }
    case ActionTypes.BACKEND_TASK_STARTED: {
      const {task} = action.payload;
      return {...state, backend: {
        ...state.backend,
        tasks: [...state.backend.tasks, task]
      }};
    }
    case ActionTypes.BACKEND_TASK_FAILED: {
      const {task, error} = action.payload;
      let {backend} = state;
      let tasks = without(backend.tasks, task);
      return {...state, backend: {...backend, tasks, lastError: error}};
    }
    case ActionTypes.BACKEND_TASK_DONE: {
      const {task} = action.payload;
      let {backend} = state;
      let tasks = without(backend.tasks, task);
      return {...state, backend: {...backend, tasks}};
    }

    case ActionTypes.BACKEND_ENTITIES_LOADED: {
      const entities = updateEntities(state.entities, action.payload.entities);
      return {
        ...state,
        backend: {...state.backend, generation: state.backend.generation + 1},
        entities
      };
    }

    case ActionTypes.CONTEST_LIST_CHANGED: {
      const {contestIds} = action.payload;
      return {...state, contestIds};
    }
    case ActionTypes.CONTEST_CHANGED: {
      const {contestId} = action.payload;
      // Teams are per-contest? so when the contest changes, forget the current team.
      return {...state, contestId, teamId: 'unknown'};
    }
    case ActionTypes.TEAM_CHANGED: {
      let {teamId} = action.payload;
      return {...state, teamId};
    }
    case ActionTypes.CHAIN_LIST_CHANGED: {
      let {chainIds} = action.payload;
      return {...state, chainIds};
    }

  }
  return state;
}

function updateEntities (entities: Entities, update: EntitiesUpdate): Entities {
  const result: Entities = {...entities};
  for (let key of keysOf(update)) {
    result[key] = Object.assign({}, entities[key], update[key]);
  }
  return result;
}

export function* monitorBackendTask (saga: any): Saga {
  const taskRef = {
    task: undefined,
  };
  yield put(actionCreators.backendTaskStarted(taskRef));
  taskRef.task = yield fork(function* () {
    try {
      yield call(saga);
    } catch (ex) {
      if (!(yield cancelled())) {
        AppToaster.show({message: ex.toString()});
        yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
      }
    }
    yield put(actionCreators.backendTaskDone(taskRef));
  });
}

export function* loadUser (id: string): Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    users: testUsers
  }));
}

export function* loadContestList (): Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    contestPeriods: testContestPeriods,
    tasks: testTasks,
    taskResources: testTaskResources,
    chains: testChains,
  }));
  return ["1"];
}

export function* loadContest (id: string) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
  }));
}

export function* loadTeam (userId: string, contestId: string) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
    teams: testTeams,
    teamMembers: testTeamMembers,
  }));
  return "1";
}

export function* loadContestChains (contestId: string, filters: object) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
  }));
  return ["1"];
}
