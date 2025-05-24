'use client';

import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { firestore } from "@/lib/firebase";
import {
  doc, getDoc, updateDoc, collection, getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [companyList, setCompanyList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const userRef = doc(firestore, 'users', id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser(userSnap.data());
      }

      const companiesSnap = await getDocs(collection(firestore, 'DropdownMenu', 'companyName', 'list'));
      const companies = [];
      companiesSnap.forEach(doc => companies.push({ id: doc.id, ...doc.data() }));
      setCompanyList(companies);
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = () => {
    setUser(prev => ({
      ...prev,
      profileStatus: prev.profileStatus === 'Active' ? 'Inactive' : 'Active',
    }));
  };

  const handleCompanyToggle = (companyId, data) => {
    const assigned = user.assignedCompany || {};
    const updated = { ...assigned };

    if (assigned[companyId]) {
      delete updated[companyId];
    } else {
      updated[companyId] = data;
    }

    setUser(prev => ({ ...prev, assignedCompany: updated }));
  };

  const handleAccessToggle = (level) => {
    const access = user.accessLevelMap || {};
    setUser(prev => ({
      ...prev,
      accessLevelMap: {
        ...access,
        [level]: !access[level],
      },
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    const storageRef = ref(storage, `profiles/${id}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setUser(prev => ({ ...prev, profileImage: url }));
  };

  const handleSave = async () => {
    await updateDoc(doc(firestore, 'users', id), user);
    alert('User updated!');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="w-4 h-4" /> Back
      </Button>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>User Profile</CardTitle>
          <div className="flex items-center gap-2">
            <Switch checked={user.profileStatus === 'Active'} onCheckedChange={handleSwitchChange} />
            <Label>Status: {user.profileStatus}</Label>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Form */}
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={user.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label>Gender</Label>
              <select name="gender" value={user.gender || ''} onChange={handleChange} className="w-full border rounded p-2">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" value={user.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" value={user.phone || ''} onChange={handleChange} />
            </div>
            <div>
              <Label>Access Levels</Label>
              <div className="flex flex-col gap-1 mt-1">
                {['canEdit', 'canView', 'canDelete'].map(level => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={user.accessLevelMap?.[level] || false}
                      onChange={() => handleAccessToggle(level)}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
            {user.userType === 'Sales' && (
              <div>
                <Label>Agent ID</Label>
                <Input name="agentId" value={user.agentId || ''} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* Right Form */}
          <div className="space-y-4">
            <div>
              <Label>Profile Image</Label>
              <Input type="file" onChange={handleImageUpload} />
              {imagePreview || user.profileImage ? (
                <img src={imagePreview || user.profileImage} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />
              ) : null}
            </div>
            <div>
              <Label>User Type</Label>
              <select name="userType" value={user.userType || ''} onChange={handleChange} className="w-full border rounded p-2">
                <option value="">Select</option>
                <option value="Admin">Admin</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div>
              <Label>Address</Label>
              <Input name="address" value={user.address || ''} onChange={handleChange} />
            </div>
            <div>
              <Label>Assigned Companies</Label>
              <div className="mt-2 space-y-1 max-h-48 overflow-auto border p-2 rounded">
                {companyList.map(company => {
                  const isChecked = !!user.assignedCompany?.[company.id];
                  return (
                    <label key={company.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCompanyToggle(company.id, company)}
                      />
                      {company.name} ({company.address})
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex justify-end gap-2 p-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
