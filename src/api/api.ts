import { openmrsFetch, openmrsObservableFetch } from '@openmrs/esm-framework';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encounterRepresentation } from '../constants';
import { OpenmrsForm } from './types';
import { isUuid } from '../utils/boolean-utils';

const BASE_WS_API_URL = '/ws/rest/v1/';

export function saveEncounter(abortController: AbortController, payload, encounterUuid?: string) {
  const url = !!encounterUuid
    ? `${BASE_WS_API_URL}encounter/${encounterUuid}?v=full`
    : `${BASE_WS_API_URL}encounter?v=full`;
  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function getConcept(conceptUuid: string, v: string): Observable<any> {
  return openmrsObservableFetch(`${BASE_WS_API_URL}concept/${conceptUuid}?v=${v}`).pipe(
    map(response => response['data']),
  );
}

export function getLocationsByTag(tag: string): Observable<{ uuid: string; display: string }[]> {
  return openmrsObservableFetch(`${BASE_WS_API_URL}location?tag=${tag}&v=custom:(uuid,display)`).pipe(
    map(({ data }) => data['results']),
  );
}

export function getPreviousEncounter(patientUuid: string, encounterType) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}`;
  return openmrsFetch(`${BASE_WS_API_URL}encounter?${query}&limit=1&v=${encounterRepresentation}`).then(({ data }) => {
    return data.results.length ? data.results[0] : null;
  });
}

export function fetchConceptNameByUuid(conceptUuid: string) {
  return openmrsFetch(`${BASE_WS_API_URL}concept/${conceptUuid}/name?limit=1`).then(({ data }) => {
    if (data.results.length) {
      const concept = data.results[data.results.length - 1];
      return concept.display;
    }
  });
}

export function getLatestObs(patientUuid: string, conceptUuid: string, encounterTypeUuid?: string) {
  let params = `patient=${patientUuid}&code=${conceptUuid}${
    encounterTypeUuid ? `&encounter.type=${encounterTypeUuid}` : ''
  }`;
  // the latest obs
  params += '&_sort=-_lastUpdated&_count=1';
  return openmrsFetch(`/ws/fhir2/R4/Observation?${params}`).then(({ data }) => {
    return data.entry?.length ? data.entry[0].resource : null;
  });
}

export function getPatientIdentifier(patientUuid: string, IdentifierTypeUuid: string) {
  return openmrsFetch(`${BASE_WS_API_URL}/patient/${patientUuid}/identifier`).then(({ data }) => {
    if (data.results.length) {
      const PatientArtNumbers = data.results.filter(id => id.identifierType.uuid === IdentifierTypeUuid);
      if (PatientArtNumbers.length > 0) {
        return PatientArtNumbers[0];
      }
    }
    return null;
  });
}

/**
 * Fetches an OpenMRS form using either its name or UUID.
 * @param {string} nameOrUUID - The form's name or UUID.
 * @returns {Promise<OpenmrsForm | null>} - A Promise that resolves to the fetched OpenMRS form or null if not found.
 */
export async function fetchOpenMRSForm(nameOrUUID: string): Promise<OpenmrsForm | null> {
  if (!nameOrUUID) {
    return null;
  }

  const { url, isUUID } = isUuid(nameOrUUID)
    ? { url: `${BASE_WS_API_URL}form/${nameOrUUID}?v=full`, isUUID: true }
    : { url: `${BASE_WS_API_URL}form?q=${nameOrUUID}&v=full`, isUUID: false };

  const { data: openmrsFormResponse } = await openmrsFetch(url);
  if (isUUID) {
    return openmrsFormResponse;
  }
  return openmrsFormResponse.results?.length
    ? openmrsFormResponse.results[0]
    : new Error(`Form with ${nameOrUUID} was not found`);
}

/**
 * Fetches ClobData for a given OpenMRS form.
 * @param {OpenmrsForm} form - The OpenMRS form object.
 * @returns {Promise<any | null>} - A Promise that resolves to the fetched ClobData or null if not found.
 */
export async function fetchClobData(form: OpenmrsForm): Promise<any | null> {
  if (!form) {
    return null;
  }

  const jsonSchemaResource = form.resources.find(({ name }) => name === 'JSON schema');
  if (!jsonSchemaResource) {
    return null;
  }

  const clobDataUrl = `${BASE_WS_API_URL}clobdata/${jsonSchemaResource.valueReference}`;
  const { data: clobDataResponse } = await openmrsFetch(clobDataUrl);

  return clobDataResponse;
}
