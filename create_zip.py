import os
import zipfile

def is_excluded(path):
    # Always normalize the path separators for Windows/Linux consistency
    path = path.replace(os.sep, '/')
    
    # Base exclusions (from Original)
    base_excluded = ['node_modules', '.next', '.git', 'out', '.vercel']
    for b in base_excluded:
        if path.startswith(b + '/') or path == b:
            return True

    # Heavy/generated exclusions for android and ios
    heavy_excluded = [
        'android/.gradle',
        'android/app/build',
        'android/gradle/wrapper/gradle-wrapper.jar',
        'android/app/src/main/assets/public',
        'ios/App/Pods',
        'ios/App/App.xcworkspace/xcuserdata',
        'ios/App/build',
        'ios/App/DerivedData'
    ]
    for h in heavy_excluded:
        if path.startswith(h + '/') or path == h:
            return True
            
    if path == 'create_zip.py' or path.endswith('.zip'):
        return True

    return False

def zipdir(path, ziph):
    # Track critical files
    included_critical = {
        'ios/App/App/Info.plist': False,
        'android/app/build.gradle': False
    }

    for root, dirs, files in os.walk(path):
        # We modify dirs in place to prune directories we don't want to walk
        dirs[:] = [d for d in dirs if not is_excluded(os.path.relpath(os.path.join(root, d), path))]

        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, path)
            
            if not is_excluded(rel_path):
                ziph.write(file_path, rel_path)
                
                # Check for critical files
                rel_path_fwd = rel_path.replace(os.sep, '/')
                if rel_path_fwd == 'ios/App/App/Info.plist':
                    included_critical['ios/App/App/Info.plist'] = True
                if rel_path_fwd == 'android/app/build.gradle':
                    included_critical['android/app/build.gradle'] = True

    return included_critical

if __name__ == '__main__':
    zip_path = 'buddha-app-redesign.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        critical_status = zipdir('.', zipf)
    
    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"Created {zip_path} - Size: {size_mb:.2f} MB")
    
    print("\n--- Critical Files Check ---")
    if critical_status['ios/App/App/Info.plist']:
        print("✓ ios/App/App/Info.plist included")
    else:
        print("✗ MISSING Info.plist")
        
    if critical_status['android/app/build.gradle']:
        print("✓ android/app/build.gradle included")
    else:
        print("✗ MISSING build.gradle")
    print("----------------------------")
