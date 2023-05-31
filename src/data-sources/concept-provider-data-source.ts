import { openmrsFetch } from '@openmrs/esm-framework';
import { DataSource, EncounterProvider, UuidAndDisplay } from '../api/types';

export class ConceptDataSource implements DataSource<EncounterProvider> {
  private readonly url = '/ws/rest/v1/concept?';

  fetchData(searchTerm: string): Promise<EncounterProvider[]> {
    return openmrsFetch(`${this.url}q=${searchTerm}`).then(({ data }) => {
      return data.results;
    });
  }

  toUuidAndDisplay(concept: any): UuidAndDisplay {
    return {
      uuid: concept.uuid,
      display: concept.display,
    };
  }
}
