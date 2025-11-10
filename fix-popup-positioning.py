#!/usr/bin/env python3
"""
Fix popup positioning in TurnView and RiverView to prevent cutoff
"""
import re

def fix_popup_positioning(file_path):
    """Apply the fixed positioning logic to a view file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix 1: Update the popupPositions type
    content = re.sub(
        r"const \[popupPositions, setPopupPositions\] = useState<Record<string, 'above' \| 'below'>>",
        r"const [popupPositions, setPopupPositions] = useState<Record<string, 'above' | 'below' | number>>",
        content
    )

    # Fix 2: Update the positioning calculation
    old_positioning = r'''                                        // Determine optimal position
                                        const shouldPositionAbove = spaceBelow < estimatedPopupHeight && spaceAbove > spaceBelow;

                                        setPopupPositions\(prev => \(\{
                                          \.\.\.prev,
                                          \[historyKey\]: shouldPositionAbove \? 'above' : 'below'
                                        \}\)\);'''

    new_positioning = '''                                        // Determine optimal position with better logic
                                        // Position above if: not enough space below AND more space above
                                        const shouldPositionAbove = spaceBelow < estimatedPopupHeight && spaceAbove > spaceBelow;

                                        // Calculate the actual top position for the popup
                                        let topPosition: number;
                                        if (shouldPositionAbove) {
                                          // Position above: popup bottom aligns with button top, with some margin
                                          topPosition = Math.max(10, buttonRect.top - estimatedPopupHeight - 8);
                                        } else {
                                          // Position below: popup top aligns with button bottom, with some margin
                                          topPosition = buttonRect.bottom + 8;
                                        }

                                        setPopupPositions(prev => ({
                                          ...prev,
                                          [historyKey]: shouldPositionAbove ? 'above' : 'below',
                                          [`${historyKey}_top`]: topPosition
                                        }));'''

    content = re.sub(old_positioning, new_positioning, content, flags=re.DOTALL)

    # Fix 3: Update the popup rendering with fixed positioning
    old_render = r'''                            \{/\* Floating Card - Stack History \*/\}
                            \{isExpanded && currentStack !== null && \(\(\) => \{
                              const position = popupPositions\[historyKey\] \|\| 'below';
                              const positionClasses = position === 'above'
                                \? 'absolute z-\[100\] bottom-full mb-2 left-1/2 transform -translate-x-1/2'
                                : 'absolute z-\[100\] mt-2 left-1/2 transform -translate-x-1/2';

                              return \(
                                <div data-stack-history-card=\{historyKey\} className=\{positionClasses\} style=\{\{ minWidth: '400px', maxWidth: '460px' \}\}>'''

    new_render = '''                            {/* Floating Card - Stack History */}
                            {isExpanded && currentStack !== null && (() => {
                              const position = popupPositions[historyKey] || 'below';
                              const topPosition = popupPositions[`${historyKey}_top`] as number || 0;
                              const positionClasses = 'fixed z-[9999] left-1/2 transform -translate-x-1/2';

                              return (
                                <div
                                  data-stack-history-card={historyKey}
                                  className={positionClasses}
                                  style={{
                                    minWidth: '400px',
                                    maxWidth: '460px',
                                    top: `${topPosition}px`,
                                    maxHeight: 'calc(100vh - 20px)',
                                    overflowY: 'auto'
                                  }}
                                >'''

    content = re.sub(old_render, new_render, content, flags=re.DOTALL)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Fixed {file_path}")
        return True
    else:
        print(f"[INFO] No changes needed for {file_path}")
        return False

if __name__ == '__main__':
    files_to_fix = [
        'src/components/game/TurnView.tsx',
        'src/components/game/RiverView.tsx'
    ]

    for file_path in files_to_fix:
        fix_popup_positioning(file_path)
