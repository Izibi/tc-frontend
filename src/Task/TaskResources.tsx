
import * as React from 'react';
import {connect} from 'react-redux';

import {State, DispatchProp} from '../app';
import {TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';
import {selectors} from '../Backend';

type StoreProps = {
  loaded: boolean,
  contestId?: string,
  resources?: TaskResource[],
  currentResource?: TaskResource,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State): StoreProps {
  try {
    const {contestId, taskResourceIndex} = state;
    const contest = selectors.getContest(state, state.contestId);
    const resources = selectors.getTaskResources(state, contest.task.id);
    let currentResource: TaskResource | undefined;
    currentResource = resources[taskResourceIndex];
    return {loaded: true, contestId, resources, currentResource};
  } catch (ex) {
    return {loaded: false};
  }
}

class TaskResourcesPage extends React.PureComponent<Props> {
  render () {
    let resourceOptions : JSX.Element[] | undefined;
    const {loaded, contestId, resources, currentResource} = this.props;
    if (loaded && contestId && resources) {
      resourceOptions = resources.map((resource, index) =>
        <TaskResourceOption key={index} resource={resource} index={index} contestId={contestId} selected={currentResource === resource} />);
      resourceOptions.reverse(); // Shoot your graphist.
    }
    console.log('currentResource', currentResource);
    return (
      <div>
        <ContestHeader/>
        <div className="tabLayout">
          <div className="tabSelector">
            {resourceOptions}
          </div>
          <div className="pageContent">
            {currentResource && currentResource.url !== undefined && <iframe src={currentResource.url} />}
            {currentResource && currentResource.html !== undefined && <iframe srcDoc={currentResource.html}/>}
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
  resource: TaskResource,
}
const TaskResourceOption : React.StatelessComponent<TaskResourceOptionProps> = (props) => {
  const {index, contestId, selected, resource} = props;
  return (
    <div className={selected ? "selected" : ""} title={resource.description}>
      <Link to="TaskResources" params={{contestId: contestId, resourceIndex: index}} text={resource.title} />
    </div>
  );
};

export default connect(mapStateToProps)(TaskResourcesPage);
