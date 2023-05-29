import { useSession } from '@openmrs/esm-framework';
import { SubmissionHandler } from '..';
import { OpenmrsEncounter, OHRIFormField } from '../api/types';
import { EncounterContext } from '../ohri-form-context';

export const EncounterProviderHandler: SubmissionHandler = {
  handleFieldSubmission: (field: OHRIFormField, value: any, context: EncounterContext) => {
    context.setEncounterProvider(value);
    return value;
  },
  getInitialValue: (encounter: OpenmrsEncounter, field: OHRIFormField, allFormFields?: OHRIFormField[]) => {
    return encounter.encounterProviders[0];
  },

  getDisplayValue: (field: OHRIFormField, value: any) => {
    return field.value ? field.value : null;
  },
  getPreviousValue: (field: OHRIFormField, value: any) => {
    return null;
  },
};
