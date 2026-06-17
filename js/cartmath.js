// ============================================================
// Wahh Kids — Cart pricing math (shared by cart + checkout)
// ============================================================
import { COUPONS } from './data.js';

export const SHIPPING = {
  standard: { label: 'Standard (4-7 days)', cost: 49 },
  express:  { label: 'Express (2-3 days)',  cost: 129 },
  free:     { label: 'Free pickup point',   cost: 0 },
};
export const TAX_RATE = 0.05; // 5% GST (demo)
export const FREE_SHIP_OVER = 999;

export function findCoupon(code) {
  if (!code) return null;
  return COUPONS.find(c => c.code.toUpperCase() === String(code).toUpperCase()) || null;
}

export function computeTotals(lines, { couponCode = null, shipping = 'standard', giftWrap = false } = {}) {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const coupon = findCoupon(couponCode);
  let discount = 0;
  let freeShip = false;
  let couponError = null;

  if (coupon) {
    if (subtotal < coupon.min) {
      couponError = `Spend ${'₹' + coupon.min.toLocaleString('en-IN')} to use ${coupon.code}`;
    } else if (coupon.type === 'percent') {
      discount = Math.round(subtotal * coupon.value / 100);
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
    } else if (coupon.type === 'ship') {
      freeShip = true;
    }
  }

  let shipCost = SHIPPING[shipping] ? SHIPPING[shipping].cost : SHIPPING.standard.cost;
  if (subtotal - discount >= FREE_SHIP_OVER) shipCost = Math.min(shipCost, 0);
  if (freeShip) shipCost = 0;

  const giftCost = giftWrap ? 49 : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = Math.max(0, taxable + shipCost + tax + giftCost);

  return { subtotal, discount, shipping: shipCost, tax, giftCost, total, coupon, couponError, freeShipEligible: subtotal >= FREE_SHIP_OVER };
}
