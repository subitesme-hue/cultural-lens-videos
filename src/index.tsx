import React from 'react';
import {Composition, registerRoot} from 'remotion';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import {LeadVideo, LeadProps, totalFrames} from './LeadVideo';
import sample from '../props.sample.json';

const Root: React.FC = () => (
  <Composition
    id="LensLead"
    component={LeadVideo as unknown as React.FC<Record<string, unknown>>}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={300}
    defaultProps={sample as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as LeadProps).timing)})}
  />
);
registerRoot(Root);
