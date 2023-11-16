import { fireEvent, render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import React from 'react';
import { OHRIFormField, EncounterContext, OHRIFormContext } from '../../..';
import { ObsSubmissionHandler } from '../../../submission-handlers/base-handlers';
import { OHRIUnspecified } from './ohri-unspecified.component';
import { findTextOrDateInput } from '../../../utils/test-utils';
import OHRIDate from '../date/ohri-date.component';

const question: OHRIFormField = {
  label: 'Visit Date',
  type: 'obs',
  questionOptions: {
    rendering: 'date',
    concept: '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  id: 'visit-date',
};

const encounterContext: EncounterContext = {
  patient: {
    id: '833db896-c1f0-11eb-8529-0242ac130003',
  },
  location: {
    uuid: '41e6e516-c1f0-11eb-8529-0242ac130003',
  },
  encounter: {
    uuid: '873455da-3ec4-453c-b565-7c1fe35426be',
    obs: [],
  },
  sessionMode: 'enter',
  encounterDate: new Date(2020, 11, 29),
  setEncounterDate: (value) => {},
};

const renderForm = (intialValues) => {
  render(
    <Formik initialValues={intialValues} onSubmit={null}>
      {(props) => (
        <Form>
          <OHRIFormContext.Provider
            value={{
              values: props.values,
              setFieldValue: props.setFieldValue,
              setEncounterLocation: jest.fn(),
              obsGroupsToVoid: [],
              setObsGroupsToVoid: jest.fn(),
              encounterContext: encounterContext,
              fields: [question],
              isFieldInitializationComplete: true,
              isSubmitting: false,
              formFieldHandlers: { obs: ObsSubmissionHandler },
            }}>
            <OHRIDate question={question} onChange={jest.fn()} handler={ObsSubmissionHandler} />
            <OHRIUnspecified question={question} onChange={jest.fn()} handler={ObsSubmissionHandler} />
          </OHRIFormContext.Provider>
        </Form>
      )}
    </Formik>,
  );
};

describe('Unspecified', () => {
  it('Should toggle the "Unspecified" checkbox on click', async () => {
    // setup
    await renderForm({});
    const unspecifiedCheckbox = screen.getByRole('checkbox', { name: /Unspecified/ });

    // assert initial state
    expect(unspecifiedCheckbox).not.toBeChecked();

    // assert checked
    fireEvent.click(unspecifiedCheckbox);
    expect(unspecifiedCheckbox).toBeChecked();

    // assert unchecked
    fireEvent.click(unspecifiedCheckbox);
    expect(unspecifiedCheckbox).not.toBeChecked();
  });

  it('Should clear field value when the "Unspecified" checkbox is clicked', async () => {
    //setup
    await renderForm({});
    const unspecifiedCheckbox = screen.getByRole('checkbox', { name: /Unspecified/ });
    const visitDateField = await findTextOrDateInput(screen, 'Visit Date');

    // assert initial state
    expect(unspecifiedCheckbox).not.toBeChecked();
    expect((await visitDateField).value).toBe('');

    //Assert date change
    fireEvent.blur(visitDateField, { target: { value: '2023-09-09T00:00:00.000Z' } });
    expect(visitDateField.value).toBe('09/09/2023');

    // assert checked
    fireEvent.click(unspecifiedCheckbox);
    expect(unspecifiedCheckbox).toBeChecked();
    expect(visitDateField.value).toBe('');
  });
});
