import React from 'react';
import styles from './inline-loader.scss';
import { InlineLoading } from '@carbon/react';

const InlineLoader: React.FC = () => (
  <div className={styles.loader}>
    <div>
      <InlineLoading status="active" />
    </div>
  </div>
);

export default InlineLoader;
