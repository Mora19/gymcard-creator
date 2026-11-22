export const BASE_PRICE_CENTS = 499;
export const BAND_SURCHARGE_CENTS = 100;
export const STUDIO_LOGO_SURCHARGE_CENTS = 100;

export function getUnitPriceCents({
  withBand,
  withStudioLogo,
}: {
  withBand: boolean;
  withStudioLogo: boolean;
}): number {
  return (
    BASE_PRICE_CENTS +
    (withBand ? BAND_SURCHARGE_CENTS : 0) +
    (withStudioLogo ? STUDIO_LOGO_SURCHARGE_CENTS : 0)
  );
}
