# Pot Calculation Display Demo

## 🎯 How to View the Demo

I've added the Pot Calculation Display component to your app. Here's how to access it:

### Method 1: Using Browser Console (Easiest)

1. **Open your app** in the browser (should already be running at `http://localhost:5173`)

2. **Open browser console** (F12 or right-click → Inspect → Console)

3. **Run this command** in the console:
```javascript
// Access the game state and change view
window.dispatchEvent(new CustomEvent('setView', { detail: 'pot-demo' }));
```

OR manually navigate by typing this in the console:
```javascript
// This will work if you have access to the state actions
// (You may need to add a global reference to actions first)
```

### Method 2: Temporary Button (Recommended)

Add a temporary button to your Stack Setup view:

1. Open `src/components/StackSetupView.tsx`

2. Find the header section with "Clear All" and "Export" buttons

3. Add this button:
```tsx
<button
  onClick={() => actions.setCurrentView('pot-demo')}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
>
  🎰 View Pot Demo
</button>
```

### Method 3: Direct TypeScript Update

Update your types to include the new view:

1. Find where `currentView` type is defined (likely in `types/poker.ts` or `hooks/useGameState.ts`)

2. Add `'pot-demo'` to the allowed views

3. The view should now be accessible via `actions.setCurrentView('pot-demo')`

---

## 📁 Files Created

### 1. **React Component** (Production Ready)
- **Location**: `src/components/poker/PotCalculationDisplay.tsx`
- **Purpose**: Reusable component for displaying pot calculations
- **Features**:
  - ✅ Player list in pot header
  - ✅ Expandable/collapsible pots
  - ✅ Calculation transparency with formulas
  - ✅ Street-by-street breakdown
  - ✅ ALL-IN badges and excluded players
  - ✅ Fully typed with TypeScript
  - ✅ Tailwind CSS styling

### 2. **Demo Page**
- **Location**: `src/pages/PotCalculationDemo.tsx`
- **Purpose**: Example usage with sample data
- **Contains**: Realistic poker scenario with main pot + 2 side pots

### 3. **App.tsx Integration**
- Added route handler for `currentView === 'pot-demo'`
- Imports the demo page component

---

## 🎨 What You'll See

When you navigate to the pot demo, you'll see:

### **Total Pot Card** (Green)
- Shows total pot: **$19,000**
- Quick breakdown of all pots

### **Main Pot** (Gold/Yellow)
- **$12,500** - 5 players eligible
- Shows: Alice, Bob (ALL-IN), Charlie, David, Emma
- Expandable to see:
  - Calculation formula
  - Street contributions (Preflop, Flop, Turn, River)
  - Info box explaining the pot

### **Side Pot 1** (Blue)
- **$4,800** - 4 players eligible
- Shows: Alice, Charlie, David, Emma
- Excluded: Bob (grayed out)

### **Side Pot 2** (Purple)
- **$1,700** - 2 players eligible
- Shows: Alice, Charlie
- Excluded: Bob, David, Emma (grayed out)

---

## 🚀 Next Steps

1. **View the demo** to see the design in action
2. **Review the component** (`PotCalculationDisplay.tsx`)
3. **Plan integration** with your actual pot calculation engine
4. **Customize** colors, layout, or functionality as needed

---

## 📝 Component API

To use this component in production, you'll need to provide:

```typescript
<PotCalculationDisplay
  totalPot={19000}              // Total of all pots
  mainPot={mainPotInfo}         // PotInfo object
  sidePots={[sidePot1, sidePot2]} // Array of PotInfo objects
  players={playersArray}        // Your players array
/>
```

### PotInfo Type Structure:
```typescript
interface PotInfo {
  potType: 'main' | 'side';
  potNumber?: number;           // 1, 2, 3... for side pots
  amount: number;
  eligiblePlayers: Player[];
  excludedPlayers?: Array<{
    player: Player;
    reason: string;
  }>;
  contributions: PlayerContribution[];
  streetBreakdown: StreetContribution[];
  calculation: {
    formula: string;
    variables: Record<string, any>;
    result: string;
  };
  description: string;
}
```

See `PotCalculationDisplay.tsx` for full type definitions and example usage.

---

## 🛠️ Troubleshooting

**If you can't see the demo:**

1. Check browser console for errors
2. Verify the files were created:
   - `src/components/poker/PotCalculationDisplay.tsx` ✓
   - `src/pages/PotCalculationDemo.tsx` ✓
3. Verify `App.tsx` was updated with the import and route
4. Try refreshing the page or restarting the dev server

**Need Help?**
- Let me know what method you used to navigate
- Share any console errors if you see them
- I can add more navigation options if needed

---

**Created**: November 8, 2025
**Component Version**: 3.0
**Status**: Ready for review and integration
