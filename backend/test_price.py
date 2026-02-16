import re

def clean_price(t):
    try:
        # Case 1: English formal (47645.00)
        if re.search(r'\.\d{2}$', t): 
            clean = t.replace(",", "")
            match = re.search(r'\d+(\.\d+)?', clean)
            if match:
                return float(match.group(0))
        
        # Case 2: Turkish format (49.117,00)
        match = re.search(r'(\d{1,3}(?:\.\d{3})*(?:,\d{2,4})?)', t)
        if match:
            val = match.group(1)
            val = val.replace(".", "").replace(",", ".")
            return float(val)
            
        # Case 3: Raw digits
        match = re.search(r'\d+', t)
        if match:
            return float(match.group(0))
            
        return 0.0
    except Exception as e:
        print(e)
        return 0.0

# Test cases
print(f"Turkish 49.443,00 -> {clean_price('49.443,00')}") # 49443.0
print(f"English 47645.00 -> {clean_price('47645.00')}") # 47645.0
print(f"Mixed 49.117 -> {clean_price('49.117')}") # 49117.0 (Turkish w/o decimals)
print(f"Raw 118745 -> {clean_price('118745')}") # 118745.0
print(f"Mashed 49.443,0049... -> {clean_price('49.443,0049.443,00')}") # 49443.0
