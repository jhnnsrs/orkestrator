import { Form, Formik } from "formik";
import {
  CreatableSearchSelectWidget,
  CreateableSearchSelect,
  SearchSelectInput,
} from "../../../components/forms/fields/search_select_input";
import { SubmitButton } from "../../../components/forms/fields/SubmitButton";
import { SwitchInputField } from "../../../components/forms/fields/switch_input";
import { TextInputField } from "../../../components/forms/fields/text_input";
import { Submit } from "../../../layout/dialog/DialogProvider";
import { TwDialog } from "../../../layout/dialog/TwDialog";
import {
  CreatePublicFaktMutation,
  CreatePublicFaktMutationVariables,
  useCreatePublicFaktMutation,
  useScopesOptionsLazyQuery,
} from "../../api/graphql";
import { withMan } from "../../man";

export const CreatePublicFaktDialgog = (
  props: Submit<CreatePublicFaktMutation>
) => {
  const [createPublicFakt] = withMan(useCreatePublicFaktMutation)();

  const [searchScopes] = withMan(useScopesOptionsLazyQuery)();

  return (
    <Formik<CreatePublicFaktMutationVariables>
      initialValues={{
        redirectUris: [""],
        identifier: "",
        version: "",
        scopes: [],
      }}
      onSubmit={async (values) => {
        console.log("submit", values);
        const res = await createPublicFakt({
          variables: values,
        });

        if (res.data?.createPublicFakt) {
          props.submit(res.data);
          return;
        }
        props.reject();
      }}
    >
      <Form>
        <TwDialog
          title="Create Public Fakt"
          buttons={
            <>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => props.reject()}
              >
                Cancel
              </button>
              <SubmitButton className="mt-3 w-full inline-flex rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-800 disabled:opacity-30">
                Submit
              </SubmitButton>
            </>
          }
        >
          <span className="font-light text-xl text-black">
            <div className="font-light text-sm mb-2">
              This repo would like to create an App on your behalf
            </div>
            <TextInputField
              name="identifier"
              label="Identifier"
              placeholder="Identifier"
              description="The identifier of the App"
            />
            <TextInputField
              name="version"
              label="Version"
              placeholder="Version"
              description="The version of the App"
            />
            <SwitchInputField
              name="confidential"
              label="Confidential"
              description="In this setting you need to provide a secret to authenticate your app. This is useful for apps that run on your own server. If you are unsure, leave this on."
              falseDescription="The client secret will be public. And every website will be able to claim the rights of this client. Your only security is to
                make sure the redirect uri is correct and only is able to redirect to domains that you control."
            />

            <CreateableSearchSelect
              name="redirectUris"
              label="Redirect uris"
              isMulti={true}
              lazySearch={async () => ({
                data: {
                  options: [],
                },
              })}
              description="Specify the redirect uris for this fakt"
            />

            <SearchSelectInput
              name="scopes"
              label="Scopes"
              isMulti={true}
              lazySearch={searchScopes}
              description="Specify the scopes you want the app to be able to claim. These are not the scopes the app will eventually claim, but the scopes you want it to be able to claim."
            />
          </span>
        </TwDialog>
      </Form>
    </Formik>
  );
};
