import { executors, Job, orb } from '@circleci/circleci-config-sdk';
import { FormikValues, useField } from 'formik';
import CommandIcon from '../../../icons/components/CommandIcon';
import DeleteItemIcon from '../../../icons/ui/DeleteItemIcon';
import { UNDEFINED_EXECUTOR } from '../../../mappings/components/ExecutorMapping';
import { JobMapping } from '../../../mappings/components/JobMapping';
import {
  DefinitionsModel,
  DefinitionSubscriptions,
  mapDefinitions,
} from '../../../state/DefinitionStore';
import { useStoreActions } from '../../../state/Hooks';
import AddButton from '../../atoms/AddButton';
import { Empty } from '../../atoms/Empty';
import InspectorProperty from '../../atoms/form/InspectorProperty';
import ListProperty from '../../atoms/form/ListProperty';
import StepListItem from '../../atoms/form/StepListItem';
import { StepDefinitionMenu } from '../../menus/definitions/StepDefinitionMenu';
import StepTypePageNav from '../../menus/definitions/subtypes/StepTypePage';
import { navSubTypeMenu } from '../../menus/SubTypeMenu';
import CollapsibleList from '../CollapsibleList';
import ParamListContainer from '../ParamListContainer';

export type JobInspectorProps = FormikValues & {
  definitions: DefinitionsModel;
  addSubscriptions?: (subscriptions: DefinitionSubscriptions) => void;
};

const getEmbeddedExecutor = (values: any) => {
  const executorKeys = ['machine', 'macos', 'docker'];

  return Object.keys(values).find((key) => executorKeys.includes(key));
};

const EmbeddedExecutor = ({
  embeddedExecutor,
  definitions,
  data,
  values,
  ...props
}: {
  embeddedExecutor: string;
  data: Job;
  definitions: DefinitionsModel;
} & FormikValues) => {
  const defineExecutor = useStoreActions((actions) => actions.define_executors);
  const updateConfirmation = useStoreActions(
    (actions) => actions.triggerConfirmation,
  );

  const triggerToast = useStoreActions((actions) => actions.triggerToast);
  const embeddedHelper = useField({
    name: embeddedExecutor,
    ...props,
  })[2];
  const executor = useField({
    name: 'executor.name',
    ...props,
  })[2];

  const deletedExecutor = data.executor === UNDEFINED_EXECUTOR;

  return (
    <>
      <div className="flex flex-row">
        <p className="font-bold leading-5 tracking-wide">Executor</p>
        {!deletedExecutor && (
          <button
            type="button"
            className="ml-auto tracking-wide my-auto text-sm text-circle-blue font-medium  "
            onClick={() => {
              const name = data.name + '-exec-export';

              updateConfirmation({
                onConfirm: () => {
                  if (!(data.executor instanceof executors.Executor)) {
                    return;
                  }

                  embeddedHelper.setValue(undefined);
                  defineExecutor(data.executor.asReusable(name));
                  executor.setValue(name);
                  triggerToast({
                    label: name,
                    content: 'has been exported.',
                    status: 'success',
                  });
                },
                modalDialogue: {
                  body: 'Upon extracting this %s, a %s with the name %s will be created. This operation cannot be undone.',
                  button: 'Confirm',
                  buttonVariant: 'primary',
                  header: 'Confirm Executor Export',
                },
                labels: ['executor', 'reusable executor', name],
              });
            }}
          >
            Export as Definition
          </button>
        )}
      </div>
      <div className="px-3 py-2 my-2 bg-circle-gray-200 border w-full border-circle-gray-300 rounded flex flex-row">
        {deletedExecutor ? `Deleted Executor` : `Embedded ${embeddedExecutor}`}
        <button
          onClick={() => {
            embeddedHelper.setValue(undefined);
            executor.setValue('Select Executor');
          }}
          type="button"
          className="my-auto ml-auto"
        >
          <DeleteItemIcon className="w-3 h-3" color="#AAAAAA" />
        </button>
      </div>
    </>
  );
};

const JobInspector = ({
  data,
  definitions,
  subscriptions,
  setSubscriptions,
  ...props
}: JobInspectorProps) => {
  const navigateTo = useStoreActions((actions) => actions.navigateTo);
  const embeddedExecutor = getEmbeddedExecutor(props.values);

  return (
    <div>
      <InspectorProperty label="Name" name="name" required />
      {embeddedExecutor ? (
        <EmbeddedExecutor
          embeddedExecutor={embeddedExecutor}
          definitions={definitions}
          data={data}
          {...props}
        />
      ) : (
        <>
          <InspectorProperty
            label="Executor"
            as="select"
            name="executor.name"
            placeholder="Select Executor"
            className="w-full"
            required
            onChange={(e: string) => {
              const subscription = { name: e, type: 'executors' };
              const subs = subscriptions
                ? [...subscriptions, subscription]
                : [subscription];

              setSubscriptions && setSubscriptions(subs);
            }}
            dependent={(executorName: string) => {
              const splitName = executorName?.split('/');

              if (!splitName) {
                return <></>;
              }
              const executor =
                splitName.length === 1
                  ? definitions.executors[executorName]?.value
                  : definitions.orbs[splitName[0]].value.executors[
                      splitName[1]
                    ];

              return (
                <>
                  {executor?.parameters && (
                    <>
                      <CollapsibleList title="Properties" expanded>
                        <div className="pt-2">
                          <ParamListContainer
                            paramList={executor.parameters}
                            parent="executor"
                          />
                        </div>
                      </CollapsibleList>
                      <div className="w-full border-b border-circle-gray-300 my-2"></div>
                    </>
                  )}
                </>
              );
            }}
          >
            {[
              ...mapDefinitions(definitions.executors, (executor) => (
                <option value={executor.name} key={executor.name}>
                  {executor.name}
                </option>
              )),
              ...mapDefinitions<orb.OrbImport>(
                definitions.orbs,
                (orb) =>
                  orb.executors &&
                  Object.values(orb.executors).map((executor) => (
                    <option value={executor.name} key={executor.name}>
                      {executor.name}
                    </option>
                  )),
              ),
            ]}
          </InspectorProperty>
        </>
      )}

      <ListProperty
        label="Steps"
        name="steps"
        values={props.values}
        expanded
        required
        listItem={StepListItem}
        labels={(values: { name: string }): string[] => [
          'Step',
          `${values?.name || Object.keys(values)[0]}`,
        ]}
        empty={
          <Empty
            label="No Steps Yet"
            Logo={CommandIcon}
            description={
              <>
                Add a step by clicking the button above.
                <br />
                At least one step is required.
              </>
            }
          />
        }
        pinned={
          <AddButton
            className="ml-auto flex"
            onClick={() => {
              navigateTo(
                navSubTypeMenu(
                  {
                    typePage: StepTypePageNav,
                    menuPage: StepDefinitionMenu,
                    passThrough: { dataType: JobMapping },
                  },
                  props.values,
                  subscriptions,
                ),
              );
            }}
          />
        }
      ></ListProperty>
    </div>
  );
};

export default JobInspector;
