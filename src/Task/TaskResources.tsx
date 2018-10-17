
import * as React from 'react';
import {connect} from 'react-redux';

import {State, DispatchProp} from '../app';
import {Entity, TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';
import {selectors} from '../Backend';

type StoreProps = {
  contestId: string,
  resources: Entity<TaskResource>[] | undefined,
  currentResource: Entity<TaskResource> | undefined,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State): StoreProps {
  const {contestId, taskResourceIndex} = state;
  const contest = selectors.getContest(state, state.contestId);
  let resources: Entity<TaskResource>[] | undefined;
  let currentResource: Entity<TaskResource> | undefined;
  if (contest.isLoaded && contest.value.task.isLoaded) {
    resources = contest.value.task.value.resources;
    currentResource = resources[taskResourceIndex];
  }
  return {contestId, resources, currentResource};
}

class TaskResourcesPage extends React.PureComponent<Props> {
  render () {
    let resourceOptions : JSX.Element[] | undefined;
    const {contestId, resources, currentResource} = this.props;
    if (resources) {
      resourceOptions = resources.map((resource, index) =>
        <TaskResourceOption key={index} resource={resource} index={index} contestId={contestId} selected={currentResource === resource} />);
      resourceOptions.reverse(); // Shoot your graphist.
    }
    return (
      <div>
        <ContestHeader/>
        <div className="tabLayout">
          <div className="tabSelector">
            {resourceOptions}
          </div>
          <div className="pageContent">
            {currentResource && currentResource.isLoaded && currentResource.value.url !== undefined &&
              <iframe src={currentResource.value.url} />}
            {currentResource && currentResource.isLoaded && currentResource.value.html !== undefined &&
              <iframe srcDoc={currentResource.value.html}/>}
          </div>
        </div>
      </div>
    );
  }
}

type TaskResourceOptionProps = {
  index: number,
  contestId: string,
  selected: boolean,
  resource: Entity<TaskResource>,
}
const TaskResourceOption : React.StatelessComponent<TaskResourceOptionProps> = (props) => {
  const {index, contestId, selected, resource} = props;
  if (!resource.isLoaded) return null;
  return (
    <div className={selected ? "selected" : ""} title={resource.value.description}>
      <Link to="TaskResources" params={{contestId: contestId, resourceIndex: index}} text={resource.value.title} />
    </div>
  );
};

export default connect(mapStateToProps)(TaskResourcesPage);
