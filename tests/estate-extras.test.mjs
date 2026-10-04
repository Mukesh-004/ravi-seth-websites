import {test} from 'node:test';
import assert from 'node:assert/strict';
import {amenitySection,connectivitySection,mapSection} from '../src/estate-extras.mjs';
import {escapeHTML} from '../src/core.mjs';

test('amenity icons keep labels accessible in English and Telugu',()=>{const item={amenities:'Parking, Water supply, Lift',amenitiesTe:'పార్కింగ్, నీటి సరఫరా, లిఫ్ట్'};const en=amenitySection(item,{lang:'en',esc:escapeHTML});const te=amenitySection(item,{lang:'te',esc:escapeHTML});assert.equal((en.match(/<svg/g)||[]).length,3);assert.match(en,/Parking/);assert.match(te,/నీటి సరఫరా/);assert.match(te,/aria-hidden="true"/)});

test('property map uses a safe encoded area query and provides a map link',()=>{const item={location:'Anandapuram & Visakhapatnam',mapQuery:'Anandapuram, Visakhapatnam'};const html=mapSection(item,{lang:'en',esc:escapeHTML});assert.match(html,/maps\.google\.com\/maps\?q=Anandapuram%2C%20Visakhapatnam/);assert.match(html,/google\.com\/maps\/search/);assert.match(html,/Area guide only/);assert.match(html,/loading="lazy"/)});

test('paired amenity and connectivity labels take priority and escape submitted text',()=>{const item={amenityItems:[{en:'EV charging',te:'ఈవీ చార్జింగ్'},{en:'<script>',te:'భద్రత'}],amenities:'Legacy parking',connectivityItems:[{en:'Airport, 25 km',te:'విమానాశ్రయం, 25 కి.మీ.'}],connectivity:'Legacy distance'};const amenityEn=amenitySection(item,{lang:'en',esc:escapeHTML});const amenityTe=amenitySection(item,{lang:'te',esc:escapeHTML});const connectEn=connectivitySection(item,{lang:'en',esc:escapeHTML});const connectTe=connectivitySection(item,{lang:'te',esc:escapeHTML});assert.match(amenityEn,/EV charging/);assert.match(amenityTe,/ఈవీ చార్జింగ్/);assert.doesNotMatch(amenityEn,/Legacy parking|<script>/);assert.match(amenityEn,/&lt;script&gt;/);assert.match(connectEn,/Airport, 25 km/);assert.match(connectTe,/విమానాశ్రయం, 25 కి.మీ./);assert.doesNotMatch(connectEn,/Legacy distance/)});

test('legacy connectivity text still renders when structured labels are absent',()=>{const item={connectivity:'Airport 20 km, Railway station 8 km',connectivityTe:'విమానాశ్రయం 20 కి.మీ., రైల్వే స్టేషన్ 8 కి.మీ.'};const en=connectivitySection(item,{lang:'en',esc:escapeHTML});const te=connectivitySection(item,{lang:'te',esc:escapeHTML});assert.match(en,/Railway station 8 km/);assert.match(te,/రైల్వే స్టేషన్ 8 కి.మీ./)});
