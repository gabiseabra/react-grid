import React from "react";

type Provider<R> = React.ComponentType<{
  children: (props: R) => React.ReactNode | JSX.Element;
}>;

export const hoc = <P extends {}, P_ = any>(Provider: Provider<P>) => (
  Component: React.ComponentType<P & P_>
) => (props: P_): JSX.Element => (
  <Provider>{(nextProps) => <Component {...props} {...nextProps} />}</Provider>
);

export const withProps = <P extends {}>(staticProps: P) => <P_ extends {}>(
  Component: React.ComponentType<P & P_>
) => (dynamicProps: Partial<P> & P_): JSX.Element => (
  <Component {...staticProps} {...dynamicProps} />
);
