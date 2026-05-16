import ShopItemCard from './ShopItemCard'
import { SHOP_CATALOG, ITEMS } from '../../constants/character'

export default function ShopItemGrid({
  category,
  owned,
  equipped,
  userEquipped,
  bookmark,
  onBuy,
  onEquip,
  onUnequip,
}) {
  const itemIds = SHOP_CATALOG[category] ?? []

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {itemIds.map((itemId) => {
        const price = ITEMS[itemId]?.price ?? 0
        const isOwned = owned?.has(itemId) ?? false
        const isEquipped = equipped?.[category] === itemId
        const canAfford = (bookmark ?? 0) >= price
        return (
          <ShopItemCard
            key={itemId}
            itemId={itemId}
            category={category}
            price={price}
            owned={isOwned}
            equipped={isEquipped}
            userEquipped={userEquipped}
            canAfford={canAfford}
            onBuy={onBuy}
            onEquip={onEquip}
            onUnequip={onUnequip}
          />
        )
      })}
    </div>
  )
}
