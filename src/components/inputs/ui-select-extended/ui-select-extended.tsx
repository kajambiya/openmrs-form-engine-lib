import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ComboBox, InlineLoading, DropdownSkeleton, NotificationButton } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { OHRIFormField, OHRIFormFieldProps } from '../../../api/types';
import { useField } from 'formik';
import styles from './ui-select-extended.scss';
import { OHRIFormContext } from '../../../ohri-form-context';
import { getConceptNameAndUUID } from '../../../utils/ohri-form-helper';
import { OHRIFieldValueView } from '../../value/view/ohri-field-value-view.component';
import { isTrue } from '../../../utils/boolean-utils';
import { getDataSource } from '../../../registry/registry';
import { fieldRequiredErrCode, isEmpty } from '../../../validators/ohri-form-validator';
import { PreviousValueReview } from '../../previous-value-review/previous-value-review.component';
import debounce from 'lodash-es/debounce';
import LoadingIcon from '../../loaders/loading.component';

export const UISelectExtended: React.FC<OHRIFormFieldProps> = ({ question, handler, onChange }) => {
  const [field, meta] = useField(question.id);
  const { setFieldValue, encounterContext, fields } = React.useContext(OHRIFormContext);
  const [conceptName, setConceptName] = useState('Loading...');
  const [items, setItems] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isFieldRequiredError = useMemo(() => errors[0]?.errCode == fieldRequiredErrCode, [errors]);
  const [previousValueForReview, setPreviousValueForReview] = useState(null);
  const inputValue = useRef('');
  const dataSource = useMemo(() => getDataSource(question.questionOptions['datasource']), []);
  useEffect(() => {
    if (question['submission']) {
      question['submission'].errors && setErrors(question['submission'].errors);
      question['submission'].warnings && setWarnings(question['submission'].warnings);
    }
  }, [question['submission']]);

  const handleChange = value => {
    setFieldValue(question.id, value);
    onChange(question.id, value, setErrors, setWarnings);
    question.value = handler?.handleFieldSubmission(question, value, encounterContext);
  };

  const debouncedSearch = debounce((searchterm, dataSource) => {
    setIsLoading(true);
    dataSource.fetchData(searchterm).then(dataItems => {
      setItems(dataItems.map(dataSource.toUuidAndDisplay));
      //setIsLoading(false);
    });
  }, 300);

  useEffect(() => {
    // If not searchable, preload the items
    if (dataSource && !isTrue(question.questionOptions['isSearchable'])) {
      setIsLoading(true);
      console.log('Is loading..');
      dataSource.fetchData().then(dataItems => {
        setItems(dataItems.map(dataSource.toUuidAndDisplay));
        //setIsLoading(false);
      });
    }
  }, [dataSource]);
  console.log(isLoading);

  useEffect(() => {
    // get the data source
    if (dataSource && isTrue(question.questionOptions['isSearchable']) && !isEmpty(searchTerm)) {
      debouncedSearch(searchTerm, dataSource);
    } else {
      // TODO: Handle this case
    }
  }, [dataSource, searchTerm]);

  useEffect(() => {
    getConceptNameAndUUID(question.questionOptions.concept).then(conceptTooltip => {
      setConceptName(conceptTooltip);
    });
  }, [conceptName]);

  useEffect(() => {
    if (encounterContext?.previousEncounter && !question.questionOptions.usePreviousValueDisabled) {
      const prevValue = handler?.getPreviousValue(question, encounterContext?.previousEncounter, fields);
      if (!isEmpty(prevValue?.value)) {
        setPreviousValueForReview(prevValue);
      }
    }
  }, [encounterContext?.previousEncounter]);

  const handleStateChange = (changes, stateAndHelpers) => {
    // Intercept the state change for onBlur event
    if (changes?.type === stateAndHelpers?.changeTypes?.blur && !changes?.selectedItem) {
      // Return modified state to persist the inputValue
      return { ...changes, value: inputValue.current };
    }
    return changes;
  };

  return encounterContext.sessionMode == 'view' || isTrue(question.readonly) ? (
    <div className={styles.formField}>
      <OHRIFieldValueView
        label={question.label}
        value={field.value ? field.value.display : field.value}
        conceptName={conceptName}
        isInline
      />
    </div>
  ) : (
    !question.isHidden && (
      <div className={`${styles.formInputField} ${styles.row}`}>
        <div
          className={
            isFieldRequiredError
              ? `${styles.errorLabel} ${styles.formInputField} ${styles.multiselectOverride} ${styles.flexRow}`
              : `${styles.formInputField} ${styles.multiselectOverride} ${styles.flexRow}`
          }>
          <ComboBox
            id={question.id}
            titleText={question.label}
            items={items}
            isLoading={isLoading}
            loadingMessage="loading..."
            itemToString={item => item?.display}
            selectedItem={field.value}
            shouldFilterItem={({ item, inputValue }) => {
              if (!inputValue) {
                // Carbon's initial call at component mount
                return true;
              }
              return item.display.toLowerCase().includes(inputValue.toLowerCase());
            }}
            onChange={({ selectedItem }) => handleChange(selectedItem)}
            disabled={question.disabled}
            onInputChange={value => {
              inputValue.current = value;
              if (question.questionOptions['isSearchable']) {
                setSearchTerm(value);
              }
            }}
          />
        </div>
        {isLoading ? (
          <div>
            <InlineLoading description="Loading" status="active" iconDescription="Loading" />
          </div>
        ) : null}
        {previousValueForReview && (
          <div>
            <PreviousValueReview
              value={previousValueForReview.value}
              displayText={previousValueForReview.display}
              setValue={handleChange}
            />
          </div>
        )}
      </div>
    )
  );
};
