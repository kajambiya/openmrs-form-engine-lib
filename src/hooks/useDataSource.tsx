import { useEffect, useState } from 'react';
import { getControlTemplate, getDataSource, OHRIFormField } from '..';

export function useDataSource(field: OHRIFormField) {
  const [config, setConfig] = useState({});
  const [dataSource, setDataSource] = useState(null);

  useEffect(() => {
    if (field.questionOptions.datasource?.id) {
      setDataSource(getDataSource(field.questionOptions.datasource.id));
      setConfig(field.questionOptions.datasource.config);
    } else {
      const template = getControlTemplate(field.questionOptions.rendering);
      setDataSource(getDataSource(template.datasource.id));
      setConfig(template.datasource.config);
    }
  }, [field]);

  return {
    dataSource,
    config,
  };
}
